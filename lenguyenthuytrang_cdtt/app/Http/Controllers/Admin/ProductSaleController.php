<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use App\Models\ProductSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class ProductSaleController extends Controller
{
    // --- 1. INDEX ---
    public function index(Request $request)
    {
        try {
            $query = ProductSale::query();

            // Join bảng để lấy tên sản phẩm
            $query->join('product', 'product.id', '=', 'product_sale.product_id');

            // Tìm kiếm
            if($request->has('search') && !empty($request->search)) {
                $search = trim($request->search);
                $query->where('product.name', 'like', '%' . $search . '%');
            }

            // Đếm tổng trước khi limit
            $total = $query->count();

            // Phân trang
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->orderBy('product_sale.date_begin', 'desc');
            $query->offset($offset)->limit($limit);

            // [ĐÃ SỬA]: Select thêm name, thumbnail, category_id
            $query->select(
                'product_sale.id',
                'product_sale.name',         // <--- Lấy tên chương trình khuyến mãi
                'product.name as product_name',
                'product.thumbnail',         // <--- Lấy ảnh sản phẩm
                'product.category_id',       // <--- Lấy danh mục
                'product.price_buy',         // <--- Lấy giá gốc
                'product_sale.price_sale',
                'product_sale.date_begin',
                'product_sale.date_end'
            );

            $sales = $query->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'data' => $sales,
                    'total' => $total,
                    'current_page' => (int)$page,
                    'last_page' => ceil($total / $limit)
                ],
                'message' => 'Tải dữ liệu thành công'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi Index ProductSale: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // --- 2. STORE ---
    public function store(Request $request)
    {
        Log::info("Dữ liệu gửi lên Create Sale:", $request->all());

        $request->validate([
            'name' => 'required|string|max:255', // [ĐÃ SỬA]: Thêm validate cho name
            'product_id' => 'required|exists:product,id|unique:product_sale,product_id',
            'price_sale' => 'required|numeric|min:0',
            'date_begin' => 'required|date_format:Y-m-d',
            'date_end'   => 'required|date_format:Y-m-d|after_or_equal:date_begin',
        ], [
            'product_id.unique' => 'Sản phẩm này đang có chương trình khuyến mãi, vui lòng chỉnh sửa thay vì tạo mới.',
            'product_id.exists' => 'Sản phẩm không tồn tại.',
            'date_end.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
        ]);

        try {
            $product = Product::find($request->product_id);

            $priceSale = (float)$request->price_sale;
            $priceBuy  = (float)$product->price_buy;

            if ($priceSale >= $priceBuy) {
                 return response()->json([
                    'status' => false,
                    'message' => "Giá khuyến mãi ($priceSale) phải nhỏ hơn giá gốc ($priceBuy)"
                ], 422);
            }

            $userId = Auth::id();

            // [ĐÃ SỬA]: Thêm name vào mảng create
            $sale = ProductSale::create([
                'name' => $request->name, // <--- Lưu tên khuyến mãi
                'product_id' => $request->product_id,
                'price_sale' => $priceSale,
                'date_begin' => $request->date_begin,
                'date_end'   => $request->date_end,
                'created_by' => $userId ?? 1,
                'updated_by' => $userId ?? 1
            ]);

            return response()->json([
                'status' => true,
                'data' => $sale,
                'message' => 'Thêm khuyến mãi thành công'
            ], 201);

        } catch (\Exception $e) {
            Log::error("Lỗi Store ProductSale: " . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'status' => false,
                'message' => 'Lỗi Server: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // --- 3. SHOW ---
    public function show($id)
    {
        $sale = ProductSale::with('product')->find($id);
        if (!$sale) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);
        }
        return response()->json(['status' => true, 'data' => $sale], 200);
    }

    // --- 4. UPDATE ---
    public function update(Request $request, $id)
    {
        $sale = ProductSale::find($id);
        if (!$sale) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255', // [ĐÃ SỬA]: Validate name khi update
            'product_id' => ['required', 'exists:product,id', Rule::unique('product_sale', 'product_id')->ignore($id)],
            'price_sale' => 'required|numeric|min:0',
            'date_begin' => 'required|date_format:Y-m-d',
            'date_end'   => 'required|date_format:Y-m-d|after_or_equal:date_begin',
        ]);

        try {
            $product = Product::find($request->product_id);
            if ($request->price_sale >= $product->price_buy) {
                 return response()->json([
                    'status' => false,
                    'message' => 'Giá khuyến mãi phải nhỏ hơn giá gốc'
                ], 422);
            }

            // [ĐÃ SỬA]: Thêm name vào hàm update
            $sale->update([
                'name' => $request->name, // <--- Cập nhật tên
                'product_id' => $request->product_id,
                'price_sale' => $request->price_sale,
                'date_begin' => $request->date_begin,
                'date_end'   => $request->date_end,
                'updated_by' => Auth::id() ?? 1
            ]);

            return response()->json(['status' => true, 'message' => 'Cập nhật thành công'], 200);

        } catch (\Exception $e) {
            Log::error("Lỗi Update: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // --- 5. DESTROY ---
    public function destroy($id)
    {
        try {
            $sale = ProductSale::find($id);
            if (!$sale) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);
            }
            $sale->delete();
            return response()->json(['status' => true, 'message' => 'Xóa thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
