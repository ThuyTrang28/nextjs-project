<?php

namespace App\Services;

use App\Models\Order;
use Carbon\Carbon;

class VnpayService
{
    /**
     * Build the VNPay payment URL for an order and persist the txn ref
     * used to look the order back up on return/IPN.
     */
    public function buildPaymentUrl(Order $order, string $ipAddr): string
    {
        $txnRef = $this->generateTxnRef($order);
        $order->vnp_txn_ref = $txnRef;
        $order->save();

        // VNPay's sandbox validates against Vietnam time regardless of the app's own timezone.
        $createDate = Carbon::now('Asia/Ho_Chi_Minh');
        $expireDate = $createDate->copy()->addMinutes(15);

        $data = [
            'vnp_Version' => config('vnpay.version'),
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => config('vnpay.tmn_code'),
            'vnp_Amount' => (int) round($order->total_amount * 100),
            'vnp_CurrCode' => config('vnpay.currency'),
            'vnp_TxnRef' => $txnRef,
            'vnp_OrderInfo' => 'Thanh toan don hang ' . $order->id,
            'vnp_OrderType' => 'other',
            'vnp_Locale' => config('vnpay.locale'),
            'vnp_ReturnUrl' => config('vnpay.return_url'),
            'vnp_IpAddr' => $ipAddr,
            'vnp_CreateDate' => $createDate->format('YmdHis'),
            'vnp_ExpireDate' => $expireDate->format('YmdHis'),
        ];

        $query = $this->buildSignableQuery($data);
        $secureHash = hash_hmac('sha512', $query, (string) config('vnpay.hash_secret'));

        return config('vnpay.url') . '?' . $query . '&vnp_SecureHash=' . $secureHash;
    }

    /**
     * Verify vnp_SecureHash on an inbound return/IPN request against our own secret.
     */
    public function verifySecureHash(array $params): bool
    {
        $receivedHash = $params['vnp_SecureHash'] ?? '';
        if ($receivedHash === '') {
            return false;
        }

        unset($params['vnp_SecureHash'], $params['vnp_SecureHashType']);

        $query = $this->buildSignableQuery($params);
        $expectedHash = hash_hmac('sha512', $query, (string) config('vnpay.hash_secret'));

        return hash_equals($expectedHash, strtolower($receivedHash));
    }

    /**
     * Single source of truth for verifying + applying a VNPay return/IPN result.
     * Shared by both the return-url redirect handler and the IPN handler so the
     * "mark order paid" decision is made in exactly one place.
     */
    public function processPaymentResult(array $params): array
    {
        if (!$this->verifySecureHash($params)) {
            return ['ok' => false, 'reason' => 'invalid_signature'];
        }

        $order = Order::where('vnp_txn_ref', $params['vnp_TxnRef'] ?? null)->first();

        if (!$order) {
            return ['ok' => false, 'reason' => 'order_not_found'];
        }

        $expectedAmount = (int) round($order->total_amount * 100);
        $receivedAmount = (int) ($params['vnp_Amount'] ?? 0);

        if ($expectedAmount !== $receivedAmount) {
            return ['ok' => false, 'reason' => 'invalid_amount', 'order' => $order];
        }

        // Idempotency guard: never re-process an already-confirmed payment,
        // whether this is a duplicate Return hit, a duplicate IPN hit, or both.
        if ($order->payment_status === 'paid') {
            return ['ok' => true, 'reason' => 'already_confirmed', 'order' => $order];
        }

        if (($params['vnp_ResponseCode'] ?? null) === '00') {
            $order->payment_status = 'paid';
            $order->paid_at = now();
            $order->save();

            return ['ok' => true, 'reason' => 'payment_success', 'order' => $order];
        }

        $order->payment_status = 'failed';
        $order->save();

        return ['ok' => false, 'reason' => 'payment_failed', 'order' => $order];
    }

    private function generateTxnRef(Order $order): string
    {
        return Carbon::now('Asia/Ho_Chi_Minh')->format('YmdHis') . $order->id;
    }

    /**
     * VNPay signs (and expects signed) the params sorted by key, joined as
     * urlencode(key)=urlencode(value)&..., skipping empty values. The exact
     * same string doubles as the literal query string sent to VNPay.
     */
    private function buildSignableQuery(array $data): string
    {
        ksort($data);
        $parts = [];

        foreach ($data as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }
            $parts[] = urlencode($key) . '=' . urlencode((string) $value);
        }

        return implode('&', $parts);
    }
}
