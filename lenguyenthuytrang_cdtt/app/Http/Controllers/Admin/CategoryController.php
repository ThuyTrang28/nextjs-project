<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Hiển thị danh sách danh mục (có phân trang, tìm kiếm và JOIN Parent Category).
     */
    public function index(Request $request)
    {
        try {
            $query = Category::query();

            // Join để lấy tên danh mục cha
            $query->leftJoin('category as parent_category', 'parent_category.id', '=', 'category.parent_id');

            // Tìm kiếm
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('category.name', 'like', '%' . $search . '%');
            }

            // --- BẮT ĐẦU ĐOẠN CẬP NHẬT ---
            $limitInput = $request->input('limit', 10);
            $total = $query->count();
            $page = $request->input('page', 1);

            // Kiểm tra nếu limit khác 'all' thì mới thực hiện phân trang
            if ($limitInput !== 'all') {
                $limit = (int)$limitInput;
                $offset = ($page - 1) * $limit;
                $query->offset($offset)->limit($limit);
            }
            // --- KẾT THÚC ĐOẠN CẬP NHẬT ---

            // Sắp xếp
            $query->orderBy('category.sort_order', 'asc');
            $query->orderBy('category.created_at', 'desc');

            $query->select(
                'category.id',
                'category.name',
                'category.slug',
                'parent_category.name as parent_name',
                'category.status',
                'category.created_at',
                'category.description',
                'category.parent_id'
            );

            $categories = $query->get();

            $result = [
                'status' => true,
                'data' => $categories,
                'total' => $total,
                'current_page' => (int)$page,
                // Nếu limit là 'all', last_page sẽ là 1
                'last_page' => $limitInput === 'all' ? 1 : ceil($total / (int)$limitInput),
                'message' => 'Tải dữ liệu danh mục thành công',
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
     * Lưu trữ một danh mục mới (CREATE).
     * ĐÃ SỬA ĐỂ TRÁNH LỖI 500
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:category,slug',
            'parent_id' => 'nullable|integer|exists:category,id',
            'status' => 'nullable|integer|in:0,1',
        ]);

        try {
            $data = $request->only(['name', 'slug', 'description', 'parent_id', 'status']);

            // --- SỬA ĐOẠN NÀY ĐỂ FIX LỖI 500 ---

            // 1. Fix lỗi created_by: Nếu không lấy được Auth, gán cứng là 1 (hoặc ID admin có thật)
            $userId = Auth::id();
            $data['created_by'] = $userId ? $userId : 1;

            // 2. Fix lỗi parent_id: Đảm bảo nếu frontend gửi null thì backend nhận null
            // Lưu ý: Database cột parent_id PHẢI cho phép NULL (đã hướng dẫn ở bài trước)

            // 3. Fix lỗi image/sort_order: Gán mặc định nếu thiếu
            $data['image'] = $request->input('image', null);
            $data['sort_order'] = $request->input('sort_order', 0);

            $category = Category::create($data);

            return response()->json([
                'status' => true,
                'data' => $category,
                'message' => 'Thêm danh mục thành công'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Lỗi thêm danh mục: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi Server: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết một danh mục (READ).
     */
    public function show($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        $category->load('parent');

        return response()->json([
            'status' => true,
            'data' => $category,
            'message' => 'Tải chi tiết danh mục thành công'
        ], 200);
    }

    /**
     * Cập nhật thông tin danh mục (UPDATE).
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy danh mục'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:category,slug,' . $id,
            'parent_id' => 'nullable|exists:category,id|not_in:' . $id,
            'status' => 'nullable|integer|in:0,1',
        ]);

        try {
            $data = $request->all();

            // Cập nhật người sửa (nếu có đăng nhập)
            if (Auth::id()) {
                $data['updated_by'] = Auth::id();
            }

            $category->update($data);

            return response()->json([
                'status' => true,
                'data' => $category,
                'message' => 'Cập nhật danh mục thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một danh mục (DELETE).
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy danh mục'], 404);
        }

        try {
            // Kiểm tra xem danh mục có con không? (Tùy chọn: chặn xóa nếu có con)
            if ($category->children()->count() > 0) {
                return response()->json(['status' => false, 'message' => 'Không thể xóa danh mục đang chứa danh mục con'], 400);
            }

            // Kiểm tra xem danh mục có sản phẩm không?
            if ($category->products()->count() > 0) {
                return response()->json(['status' => false, 'message' => 'Không thể xóa danh mục đang chứa sản phẩm'], 400);
            }

            $category->delete();

            return response()->json([
                'status' => true,
                'message' => 'Xóa danh mục thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa: ' . $e->getMessage()
            ], 500);
        }
    }
}
