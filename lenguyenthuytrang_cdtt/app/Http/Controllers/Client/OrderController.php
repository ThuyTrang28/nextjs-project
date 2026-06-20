<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductStore; // <--- 1. IMPORT MODEL KHO
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderSuccessMail;

class OrderController extends Controller
{
    /**
     * Lấy danh sách lịch sử đơn hàng của User đang đăng nhập
     */
    public function index()
    {
        $orders = Order::with('orderDetails.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }

    /**
     * Lấy chi tiết một đơn hàng cụ thể
     */
    public function show($id)
    {
        $order = Order::with('orderDetails.product')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $order
        ]);
    }

    /**
     * Tạo một đơn hàng mới.
     * CẬP NHẬT: Kiểm tra và Trừ tồn kho
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:product,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            // --- BƯỚC 1: KIỂM TRA TỒN KHO TRƯỚC ---
            // Phải đảm bảo tất cả sản phẩm đều đủ hàng trước khi tạo đơn
            foreach ($request->items as $item) {
                // lockForUpdate để tránh xung đột khi nhiều người mua cùng lúc
                $store = ProductStore::where('product_id', $item['product_id'])
                                     ->lockForUpdate()
                                     ->first();

                if (!$store) {
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm ID {$item['product_id']} chưa được nhập kho.",
                    ], 400);
                }

                if ($store->qty < $item['qty']) {
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm ID {$item['product_id']} chỉ còn {$store->qty} sản phẩm, không đủ để đặt hàng.",
                    ], 400);
                }
            }

            // --- BƯỚC 2: TẠO ĐƠN HÀNG ---
            $order = Order::create([
                'user_id' => Auth::check() ? Auth::id() : null,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'note' => $request->note,
                'payment_method' => $request->payment_method ?? 'cod',
                'status' => 1, // 1: Chờ xử lý
                'total_amount' => 0,
                'created_by' => Auth::check() ? Auth::id() : 0,
            ]);

            // --- BƯỚC 3: TẠO CHI TIẾT & TRỪ KHO ---
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $amount = $item['qty'] * $item['price'];

                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'qty' => $item['qty'],
                    'amount' => $amount,
                    'discount' => $item['discount'] ?? 0,
                ]);

                $totalAmount += $amount;

                // [QUAN TRỌNG] Trừ số lượng tồn kho
                // Dùng decrement để trừ trực tiếp trong DB, an toàn và chính xác
                ProductStore::where('product_id', $item['product_id'])
                            ->decrement('qty', $item['qty']);
            }

            // Cập nhật lại tổng tiền
            $order->update(['total_amount' => $totalAmount]);

            DB::commit(); // ✅ LƯU DATABASE

            // --- BƯỚC 4: GỬI MAIL ---
            try {
                Mail::to($order->email)->send(new OrderSuccessMail($order));
            } catch (\Exception $mailEx) {
                Log::error("Lỗi gửi mail đơn hàng #{$order->id}: " . $mailEx->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Đặt hàng thành công! Tổng tiền: ' . number_format($totalAmount) . ' VND',
                'order' => $order->load('orderDetails')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đặt hàng thất bại. Vui lòng thử lại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy đơn hàng
     * CẬP NHẬT: Hoàn lại tồn kho khi khách hủy
     */
    public function cancelOrder($id)
    {
        DB::beginTransaction(); // Bắt đầu Transaction
        try {
            // Load orderDetails để biết cần hoàn sản phẩm nào
            $order = Order::with('orderDetails')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->lockForUpdate() // Khóa dòng này để xử lý
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng.'
                ], 404);
            }

            // Chỉ cho phép hủy khi đơn hàng đang ở trạng thái Chờ xử lý (1)
            if ($order->status != 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Đơn hàng đã được xử lý hoặc đang vận chuyển, không thể hủy.'
                ], 400);
            }

            // [QUAN TRỌNG] Hoàn lại số lượng vào kho
            foreach ($order->orderDetails as $detail) {
                ProductStore::where('product_id', $detail->product_id)
                            ->increment('qty', $detail->qty);
            }

            // Cập nhật trạng thái đơn hàng về Hủy (0)
            $order->status = 0;
            $order->save();

            DB::commit(); // Lưu thay đổi

            return response()->json([
                'status' => true,
                'message' => 'Đã hủy đơn hàng thành công (Số lượng sản phẩm đã được hoàn lại).',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }
}
