<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Import DB để dùng Transaction

class OrderController extends Controller
{
    /**
     * Hiển thị danh sách đơn hàng.
     */
    public function index(Request $request)
    {
        try {
            // Sử dụng alias 'o' cho bảng order để code ngắn gọn hơn
            $query = Order::query()->from('order as o');

            // JOIN với bảng user để lấy tên tài khoản (nếu có)
            // LƯU Ý: Kiểm tra tên bảng trong DB của bạn là 'user' hay 'users'
            $query->leftJoin('user as u', 'u.id', '=', 'o.user_id');

            // --- TÌM KIẾM ---
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('o.name', 'like', '%' . $search . '%')
                      ->orWhere('o.phone', 'like', '%' . $search . '%')
                      ->orWhere('o.email', 'like', '%' . $search . '%')
                      ->orWhere('o.id', 'like', '%' . $search . '%'); // Tìm theo mã đơn
                });
            }

            // --- LỌC TRẠNG THÁI ---
            if ($request->has('status') && $request->status !== null && $request->status !== 'all') {
                $query->where('o.status', $request->status);
            }

            $total = $query->count();

            // --- PHÂN TRANG ---
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->orderBy('o.created_at', 'desc');
            $query->offset($offset)->limit($limit);

            // Chọn các cột cần thiết
            $query->select([
                'o.id',
                'o.name as customer_name',
                'u.name as user_account_name',
                'o.phone',
                'o.email',
                'o.address',
                'o.status',
                'o.created_at'
            ]);

            $orders = $query->get();

            return response()->json([
                'status' => true,
                'data' => $orders,
                'total' => $total,
                'message' => 'Tải dữ liệu đơn hàng thành công',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải dữ liệu đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xem chi tiết đơn hàng (SHOW).
     */
    public function show($id)
    {
        // Quan hệ:
        // - 'user': thông tin tài khoản đặt hàng
        // - 'orderDetails.product': chi tiết đơn hàng kèm thông tin sản phẩm
        $order = Order::with(['user', 'orderDetails.product'])->find($id);

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        // Mapping lại để Frontend dễ dùng (nếu Frontend đang gọi order.details)
        $order->details = $order->orderDetails;
        unset($order->orderDetails);

        return response()->json([
            'status' => true,
            'data' => $order,
            'message' => 'Tải chi tiết đơn hàng thành công'
        ], 200);
    }

    /**
     * Cập nhật trạng thái đơn hàng (UPDATE).
     */
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        $request->validate([
            'status' => 'sometimes|integer',
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
        ]);

        try {
            $data = $request->all();
            // $data['updated_by'] = auth()->id(); // Uncomment nếu có Auth

            $order->update($data);

            return response()->json([
                'status' => true,
                'data' => $order,
                'message' => 'Cập nhật đơn hàng thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa đơn hàng (DESTROY).
     */
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        try {
            DB::beginTransaction(); // Bắt đầu giao dịch để đảm bảo an toàn dữ liệu

            // 1. Xóa chi tiết đơn hàng trước
            // ✅ FIX LỖI P1013: Dùng biến $id trực tiếp, không dùng $order->id()
            OrderDetail::where('order_id', $id)->delete();

            // 2. Xóa đơn hàng chính
            $order->delete();

            DB::commit(); // Xác nhận xóa thành công cả 2

            return response()->json([
                'status' => true,
                'message' => 'Xóa đơn hàng thành công'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack(); // Hoàn tác nếu có lỗi
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
