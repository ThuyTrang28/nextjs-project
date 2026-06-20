<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use App\Models\ProductStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductStoreController extends Controller
{
    /**
     * Hiển thị danh sách tồn kho
     * Sửa đổi: Lấy từ bảng Product và LEFT JOIN sang ProductStore để đảm bảo hiển thị đủ sản phẩm
     */
    public function index(Request $request)
    {
        try {
            // Bắt đầu từ bảng Product để đảm bảo lấy hết danh sách sản phẩm
            $query = Product::query()
                ->leftJoin('product_store', 'product.id', '=', 'product_store.product_id')
                ->join('category', 'category.id', '=', 'product.category_id')
                ->select(
                    'product.id as product_id', // ID sản phẩm
                    'product_store.id as store_id', // ID kho (có thể null nếu chưa nhập kho)
                    'product.name as product_name',
                    'product.thumbnail', // <--- QUAN TRỌNG: Lấy ảnh để hiển thị ở Frontend
                    'product.price_buy as original_price', // Giá gốc từ bảng product
                    'product_store.price_root', // Giá nhập kho (có thể null)
                    'product_store.qty', // Số lượng tồn (có thể null)
                    'product_store.status', // Trạng thái kinh doanh
                    'product_store.updated_at'
                );

            // Tìm kiếm theo tên sản phẩm
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('product.name', 'like', '%' . $search . '%');
            }

            // Sắp xếp: Ưu tiên sản phẩm mới cập nhật kho
            $query->orderBy('product_store.updated_at', 'desc')
                  ->orderBy('product.created_at', 'desc');

            // Phân trang
            $limit = $request->input('limit', 10);
            $stores = $query->paginate($limit);

            return response()->json([
                'status' => true,
                'data' => $stores,
                'message' => 'Tải dữ liệu tồn kho thành công',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Nhập kho (CREATE / UPDATE)
     * Chức năng: Nhập hàng về kho.
     * Logic: Nếu đã có thì CỘNG DỒN số lượng. Nếu chưa có thì TẠO MỚI.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:product,id',
            'price_root' => 'required|numeric|min:0', // Giá nhập
            'qty' => 'required|integer|min:1',        // Số lượng nhập thêm (phải > 0)
        ]);

        try {
            DB::beginTransaction();

            // 1. Tìm xem sản phẩm này đã từng nhập kho chưa
            $store = ProductStore::where('product_id', $request->product_id)->first();

            if ($store) {
                // [TRƯỜNG HỢP ĐÃ CÓ]: Cộng dồn số lượng
                $store->qty += $request->qty;

                // Cập nhật giá nhập (thường lấy giá của lần nhập mới nhất)
                $store->price_root = $request->price_root;

                $store->updated_by = Auth::id() ?? 1;
                $store->status = 1; // Đảm bảo trạng thái là "Đang kinh doanh" khi có hàng
                $store->updated_at = now();
                $store->save();

                $message = 'Cập nhật kho thành công (Đã cộng thêm số lượng)';
            } else {
                // [TRƯỜNG HỢP CHƯA CÓ]: Tạo mới hoàn toàn
                $store = ProductStore::create([
                    'product_id' => $request->product_id,
                    'price_root' => $request->price_root,
                    'qty'        => $request->qty,
                    'status'     => 1, // Mặc định hiển thị
                    'created_by' => Auth::id() ?? 1
                ]);

                $message = 'Tạo mới kho hàng thành công';
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => $store,
                'message' => $message
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết (READ)
     */
    public function show($id)
    {
        $store = ProductStore::with('product')->find($id);

        if (!$store) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy thông tin kho'], 404);
        }

        return response()->json(['status' => true, 'data' => $store], 200);
    }

    /**
     * Cập nhật thông tin tồn kho (Sửa trực tiếp số lượng/giá - Dùng cho tính năng Edit/Kiểm kê)
     * Lưu ý: Hàm này GHI ĐÈ số lượng, không phải cộng dồn.
     */
    public function update(Request $request, $id)
    {
        $store = ProductStore::find($id);

        if (!$store) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy bản ghi kho'], 404);
        }

        $request->validate([
            'price_root' => 'required|numeric|min:0', // Giá nhập
            'qty' => 'required|integer|min:0',        // Số lượng thực tế (cho phép chỉnh về 0)
            'status' => 'sometimes|integer|in:0,1',
        ]);

        try {
            // Cập nhật từng trường cụ thể để an toàn dữ liệu (tránh sửa nhầm product_id)
            $store->price_root = $request->price_root;
            $store->qty = $request->qty; // Ghi đè số lượng mới

            if ($request->has('status')) {
                $store->status = $request->status;
            }

            $store->updated_by = Auth::id() ?? 1; // Lưu người sửa
            $store->updated_at = now();           // Cập nhật thời gian
            $store->save();

            return response()->json([
                'status' => true,
                'data' => $store,
                'message' => 'Điều chỉnh tồn kho thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi cập nhật: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật nhanh trạng thái (Toggle Status)
     */
    public function updateStatus($id, $status)
    {
        $store = ProductStore::find($id);
        if (!$store) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy bản ghi'], 404);
        }

        try {
            $store->status = $status;
            $store->updated_by = Auth::id() ?? 1;
            $store->save();

            return response()->json(['status' => true, 'message' => 'Cập nhật trạng thái thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi cập nhật: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Xóa bản ghi kho (DELETE)
     */
    public function destroy($id)
    {
        $store = ProductStore::find($id);

        if (!$store) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy bản ghi'], 404);
        }

        try {
            $store->delete();
            return response()->json(['status' => true, 'message' => 'Xóa thông tin kho thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi xóa: ' . $e->getMessage()], 500);
        }
    }
}
