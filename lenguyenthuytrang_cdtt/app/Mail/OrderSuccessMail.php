<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Order; // Import Model Order

class OrderSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order; // Biến này sẽ chứa toàn bộ thông tin đơn hàng

    /**
     * Nhận đơn hàng từ Controller truyền vào
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Dựng nội dung email
     */
    public function build()
    {
        return $this->subject('Xác nhận đơn hàng #' . $this->order->id) // Tiêu đề email
                    ->view('emails.order_success'); // Trỏ đến file giao diện (sẽ tạo ở Bước 3)
    }
}
