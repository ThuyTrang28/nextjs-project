<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .header { text-align: center; color: #d32f2f; margin-bottom: 20px; }
        .info { margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
        .total { text-align: right; font-size: 18px; font-weight: bold; color: #d32f2f; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">CẢM ƠN BẠN ĐÃ ĐẶT HÀNG!</h2>

        <p>Xin chào <strong>{{ $order->name }}</strong>,</p>
        <p>Đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã được tiếp nhận thành công.</p>

        <div class="info">
            <strong>Thông tin giao hàng:</strong><br>
            - Địa chỉ: {{ $order->address }}<br>
            - SĐT: {{ $order->phone }}<br>
            - Hình thức thanh toán: <strong>{{ strtoupper($order->payment_method ?? 'COD') }}</strong>
        </div>

        <h3>Chi tiết đơn hàng:</h3>
        <table>
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->orderDetails as $detail)
                <tr>
                    <td>{{ $detail->product->name ?? 'Sản phẩm' }}</td>
                    <td>{{ $detail->qty }}</td>
                    <td>{{ number_format($detail->price) }} ₫</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total">
            Tổng thanh toán: {{ number_format($order->total_amount ?? 0) }} ₫
        </div>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            Đây là email tự động từ hệ thống Sephora Clone.
        </p>
    </div>
</body>
</html>
