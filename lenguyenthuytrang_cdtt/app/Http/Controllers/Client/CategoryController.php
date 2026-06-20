<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách danh mục dạng Cây (Tree) để làm Menu đa cấp.
     * SỬA LỖI: Chấp nhận cả parent_id = NULL và parent_id = 0 để phù hợp với dữ liệu hiện tại.
     */
    public function getMenu()
    {
        try {
            // Lấy danh mục cha (Active) kèm theo danh mục con (Active)
            $categories = Category::where('status', 1)
                // --- SỬA ĐOẠN NÀY ĐỂ FIX LỖI MẤT DANH MỤC ---
                ->where(function($query) {
                    $query->whereNull('parent_id')
                          ->orWhere('parent_id', 0);
                })
                // ---------------------------------------------
                ->with(['children' => function($q) {
                    $q->where('status', 1)
                      ->orderBy('sort_order', 'asc');
                }])
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $categories, // Trả về dạng mảng lồng nhau (Tree)
                'message' => 'Tải menu thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị danh sách danh mục (giống Admin: có JOIN, phân trang thủ công, tìm kiếm).
     * Dùng cho trang "Tất cả danh mục" (Dạng lưới/Grid).
     */
    public function index(Request $request)
    {
        try {
            $query = Category::query();
            
            // --- KHÁC BIỆT: Chỉ lấy danh mục đang hoạt động ---
            $query->where('category.status', 1);

            // Giữ nguyên cách JOIN để lấy tên cha (nếu cần hiển thị breadcrumb hoặc tên cha)
            $query->leftJoin('category as parent_category', 'parent_category.id', '=', 'category.parent_id'); 
            
            // Tìm kiếm (Giống Admin)
            if($request->has('search') && !empty($request->search))
            {
                $search = $request->search;
                $query->where('category.name', 'like', '%'.$search.'%');
            }

            // Lọc theo Parent ID (Client thường dùng để lấy menu cấp 1: parent_id = null)
            if($request->has('parent_id')) {
                if ($request->parent_id == 'null') {
                    $query->whereNull('category.parent_id');
                } else {
                    $query->where('category.parent_id', $request->parent_id);
                }
            }

            // --- PHÂN TRANG THỦ CÔNG (Giống Admin) ---
            $limit = $request->input('limit', 10); 
            $page = $request->input('page', 1); 
            $offset = ($page - 1) * $limit;

            $total = $query->count(); // Đếm tổng

            $query->offset($offset);
            $query->limit($limit);

            // Sắp xếp (Ưu tiên thứ tự hiển thị active ở Client)
            $query->orderBy('category.sort_order', 'asc');
            $query->orderBy('category.created_at', 'desc');

            $query->select(
                'category.id', 
                'category.name', 
                'category.slug',
                'category.image',     // Client cần ảnh
                'category.description',
                'parent_category.name as parent_name', 
                'category.parent_id'
            );
            
            $categories = $query->get();

            // Trả về cấu trúc JSON y hệt Admin
            $result = [
                'status' => true,
                'data' => $categories,
                'total' => $total, 
                'current_page' => (int)$page,
                'last_page' => ceil($total / $limit),
                'message' => 'Tải danh sách danh mục thành công',
            ];
            return response()->json($result, 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi tải dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết danh mục theo SLUG (Kèm theo Products).
     * Thay thế cho hàm show($id) của Admin.
     */
    public function show(Request $request, $slug)
    {
        try {
            // 1. Tìm danh mục theo SLUG và STATUS = 1
            $category = Category::where('slug', $slug)
                                ->where('status', 1)
                                ->first();

            if (!$category) {
                return response()->json([
                    'status' => false, 
                    'data' => null, 
                    'message' => 'Không tìm thấy danh mục hoặc danh mục đã bị ẩn'
                ], 404);
            }
            
            // Load quan hệ cha/con giống Admin
            $category->load(['parent', 'children']); 

            // --- PHẦN MỞ RỘNG CHO CLIENT: Lấy sản phẩm của danh mục ---
            // Ta viết query lấy sản phẩm tương tự cách viết query danh mục ở trên
            $productQuery = $category->products()->where('status', 1);

            // Sort sản phẩm
            if ($request->has('sort')) {
                if ($request->sort == 'price_asc') $productQuery->orderBy('price_buy', 'asc');
                elseif ($request->sort == 'price_desc') $productQuery->orderBy('price_buy', 'desc');
                else $productQuery->orderBy('created_at', 'desc');
            } else {
                $productQuery->orderBy('created_at', 'desc');
            }

            // Phân trang cho sản phẩm (sử dụng paginate của Laravel cho gọn, hoặc viết thủ công tùy bạn)
            // Ở đây dùng paginate chuẩn để hứng data products
            $products = $productQuery->paginate($request->input('limit', 12));

            // Gom dữ liệu trả về
            $dataResponse = [
                'category_info' => $category, // Thông tin danh mục
                'products' => $products       // Danh sách sản phẩm có phân trang
            ];
            
            return response()->json([
                'status' => true, 
                'data' => $dataResponse, 
                'message' => 'Tải chi tiết danh mục và sản phẩm thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }
}