<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductStore; // Thêm model Store
use App\Models\ProductSale;  // Thêm model Sale
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;  // Thêm facade DB
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm ĐANG GIẢM GIÁ (Sale).
     * Route: GET /api/client/products/sale
     */
    public function product_sale(Request $request)
    {
        try {
            $limit = $request->input('limit', 12);
            $now = now();

            // 1. Subquery: Tồn kho > 0
            $productStore = ProductStore::select('product_id', DB::raw('SUM(qty) as product_qty'))
                ->groupBy('product_id');

            // 2. Subquery: Lấy các đợt Sale đang hoạt động
            $productSale = ProductSale::select('product_id', 'price_sale', 'date_begin', 'date_end')
                ->where('date_begin', '<=', $now)
                ->where('date_end', '>=', $now);

            // 3. Query chính
            $products = Product::query()
                ->where('status', 1)
                // JOIN (Inner Join) để chỉ lấy sản phẩm CÓ trong bảng Sale
                ->joinSub($productSale, 'psale', function ($join) {
                    $join->on('product.id', '=', 'psale.product_id');
                })
                // Join Store để check tồn kho
                ->joinSub($productStore, 'ps', function ($join) {
                    $join->on('product.id', '=', 'ps.product_id')
                         ->where('ps.product_qty', '>', 0);
                })
                ->select(
                    'product.*',
                    'psale.price_sale',
                    'psale.date_end', // Lấy thêm ngày kết thúc để làm đồng hồ đếm ngược (nếu cần)
                    'ps.product_qty'
                )
                ->with('images')
                // Sắp xếp theo mức giá giảm nhiều nhất (hoặc mới nhất tùy bạn)
                // Ở đây ta sắp xếp theo ngày tạo giảm giá
                ->orderBy('product.updated_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'status' => true,
                'data' => $products,
                'message' => 'Tải danh sách sản phẩm khuyến mãi thành công'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi tải sản phẩm sale: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
    /**
     * Lấy danh sách sản phẩm MỚI NHẤT (Có check tồn kho và giá Sale).
     * Route: GET /api/client/products/new
     */
    public function product_new(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            $now = now();

            // Lấy tên bảng động để tránh lỗi SQL (product hoặc products)
            $tableName = app(Product::class)->getTable();

            // 1. Subquery: Tính tổng tồn kho theo sản phẩm
            $productStore = ProductStore::select('product_id', DB::raw('SUM(qty) as product_qty'))
                ->groupBy('product_id');

            // 2. Subquery: Lấy giá khuyến mãi hợp lệ theo thời gian hiện tại
            $productSale = ProductSale::select('product_id', 'price_sale')
                ->where('date_begin', '<=', $now)
                ->where('date_end', '>=', $now);

            // 3. Query chính
            $query = Product::query()
                ->where($tableName . '.status', 1) // Chỉ lấy sản phẩm đang bật
                // Join để chỉ lấy sản phẩm có tồn kho > 0
                ->joinSub($productStore, 'ps', function ($join) use ($tableName) {
                    $join->on($tableName . '.id', '=', 'ps.product_id')
                         ->where('ps.product_qty', '>', 0);
                })
                // Left Join để lấy giá sale (nếu có)
                ->leftJoinSub($productSale, 'psale', function ($join) use ($tableName) {
                    $join->on($tableName . '.id', '=', 'psale.product_id');
                })
                // Select các cột cần thiết
                ->select(
                    $tableName . '.*',
                    'psale.price_sale',
                    'ps.product_qty'
                )
                ->with('images');

            // --- XỬ LÝ SẮP XẾP (SORTING) ---
            $sort = $request->input('sort', 'newest'); // Mặc định là 'newest'

            // Công thức tính giá thực tế: Nếu có giá sale thì lấy, không thì lấy giá gốc
            $realPriceSql = "COALESCE(psale.price_sale, {$tableName}.price_buy)";

            switch ($sort) {
                case 'price_asc': // Giá: Thấp -> Cao
                    $query->orderByRaw("{$realPriceSql} ASC");
                    break;

                case 'price_desc': // Giá: Cao -> Thấp
                    $query->orderByRaw("{$realPriceSql} DESC");
                    break;

                case 'discount_desc': // Giảm giá nhiều nhất
                    // (Giá gốc - Giá thực tế) DESC
                    $query->orderByRaw("({$tableName}.price_buy - {$realPriceSql}) DESC");
                    break;

                case 'oldest': // Cũ nhất
                    $query->orderBy($tableName . '.created_at', 'asc');
                    break;

                case 'newest': // Mới nhất (Mặc định)
                default:
                    $query->orderBy($tableName . '.created_at', 'desc');
                    break;
            }

            // Thực thi Query với phân trang
            // Lưu ý: Dùng paginate thay vì limit để frontend hiển thị đúng tổng số trang
            $products = $query->paginate($limit);

            // Giữ lại các tham số trên URL khi chuyển trang
            $products->appends($request->all());

            return response()->json([
                'status' => true,
                'data' => $products,
                'message' => 'Tải danh sách sản phẩm thành công'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi tải sản phẩm mới: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
    /**
     * Hiển thị danh sách sản phẩm (có lọc, tìm kiếm).
     * Route: GET /api/client/products
     */
    public function index(Request $request)
    {
        try {
            // Chỉ lấy sản phẩm đang hiển thị (status = 1)
            $query = Product::where('status', 1);

            // 1. Lọc theo Danh mục (nếu có slug)
            if ($request->has('category_slug')) {
                $category = Category::where('slug', $request->category_slug)->first();
                if ($category) {
                    $query->where('category_id', $category->id);
                }
            }

            // 2. Tìm kiếm theo tên
            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // 3. Sắp xếp
            $sort = $request->input('sort', 'newest');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price_buy', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price_buy', 'desc');
                    break;

                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            // 4. Phân trang
            $limit = $request->input('limit', 12);
            $products = $query->paginate($limit);

            return response()->json([
                'status' => true,
                'data' => $products,
                'message' => 'Tải danh sách sản phẩm thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Xem chi tiết sản phẩm bằng ID (CÓ KÈM GIÁ SALE & ẢNH CHI TIẾT)
     * Route: GET /api/client/products/{id}
     */
    public function show($id)
    {
        try {
            $now = now();

            // 1. Subquery lấy giá Sale hợp lệ hiện tại
            $productSale = ProductSale::select('product_id', 'price_sale', 'date_begin', 'date_end')
                ->where('date_begin', '<=', $now)
                ->where('date_end', '>=', $now);

            // 2. Query chính
            $product = Product::with(['category', 'images']) // Load thêm quan hệ images để lấy thư viện ảnh
                ->where('product.id', $id)
                ->where('product.status', 1)
                // LEFT JOIN để lấy giá sale (nếu có). Nếu không có sale thì vẫn lấy được sản phẩm.
                ->leftJoinSub($productSale, 'psale', function ($join) {
                    $join->on('product.id', '=', 'psale.product_id');
                })
                ->select(
                    'product.*',
                    'psale.price_sale', // Lấy giá sale
                    'psale.date_end'    // Lấy ngày kết thúc sale (nếu cần đếm ngược)
                )
                ->first();

            if (!$product) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $product,
                'message' => 'Tải chi tiết sản phẩm thành công'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi xem chi tiết sản phẩm ID $id: " . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy sản phẩm liên quan (Cùng danh mục).
     * Route: GET /api/client/products/related/{id}
     */
    public function related($id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['status' => false, 'data' => []], 404);
            }

            if (!$product->category_id) {
                return response()->json([
                    'status' => true,
                    'data' => [],
                    'message' => 'Không có sản phẩm liên quan (Sản phẩm không thuộc danh mục nào)'
                ], 200);
            }

            $relatedProducts = Product::where('category_id', $product->category_id)
                                    ->where('id', '!=', $id)
                                    ->where('status', 1)
                                    ->limit(4)
                                    ->inRandomOrder()
                                    ->get();

            return response()->json([
                'status' => true,
                'data' => $relatedProducts,
                'message' => 'Tải sản phẩm liên quan thành công'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi lấy sản phẩm liên quan ID $id: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

}
