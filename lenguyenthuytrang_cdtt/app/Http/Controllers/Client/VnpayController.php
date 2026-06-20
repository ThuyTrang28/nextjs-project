<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VnpayController extends Controller
{
    public function __construct(private VnpayService $vnpay)
    {
    }

    /**
     * Generate a VNPay payment URL for one of the authenticated user's own orders.
     */
    public function createPayment(Request $request, $orderId)
    {
        $order = Order::where('id', $orderId)->where('user_id', Auth::id())->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.',
            ], 404);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng này đã được thanh toán.',
            ], 400);
        }

        if (in_array((int) $order->status, [0, 5], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng đã bị hủy, không thể thanh toán.',
            ], 400);
        }

        return response()->json([
            'status' => true,
            'payment_url' => $this->vnpay->buildPaymentUrl($order, $request->ip()),
        ]);
    }

    /**
     * Browser redirect target after the user finishes on VNPay's page.
     * Public route: the only thing authorizing a state change here is the
     * verified vnp_SecureHash, never the request's own auth/session.
     */
    public function returnUrl(Request $request)
    {
        $result = $this->vnpay->processPaymentResult($request->query());
        $order = $result['order'] ?? null;

        $query = http_build_query([
            'status' => $result['ok'] ? 'success' : 'failed',
            'order_id' => $order?->id,
            'message' => $this->messageFor($result['reason'] ?? 'unknown'),
        ]);

        $frontendUrl = rtrim((string) config('vnpay.frontend_url'), '/');

        return redirect()->away("{$frontendUrl}/checkout/result?{$query}");
    }

    /**
     * Server-to-server notification from VNPay. Unreachable on localhost
     * (requires a public URL) but kept correct for real deployments.
     */
    public function ipn(Request $request)
    {
        $result = $this->vnpay->processPaymentResult($request->query());

        return response()->json($this->ipnResponseFor($result['reason'] ?? 'invalid_signature'));
    }

    private function messageFor(string $reason): string
    {
        return match ($reason) {
            'payment_success', 'already_confirmed' => 'Thanh toán thành công.',
            'invalid_signature' => 'Dữ liệu không hợp lệ.',
            'order_not_found' => 'Không tìm thấy đơn hàng.',
            'invalid_amount' => 'Số tiền không khớp.',
            'payment_failed' => 'Thanh toán không thành công hoặc đã bị hủy.',
            default => 'Có lỗi xảy ra trong quá trình thanh toán.',
        };
    }

    private function ipnResponseFor(string $reason): array
    {
        return match ($reason) {
            'invalid_signature' => ['RspCode' => '97', 'Message' => 'Invalid signature'],
            'order_not_found' => ['RspCode' => '01', 'Message' => 'Order not found'],
            'invalid_amount' => ['RspCode' => '04', 'Message' => 'Invalid amount'],
            'already_confirmed' => ['RspCode' => '02', 'Message' => 'Order already confirmed'],
            default => ['RspCode' => '00', 'Message' => 'Confirm Success'],
        };
    }
}
