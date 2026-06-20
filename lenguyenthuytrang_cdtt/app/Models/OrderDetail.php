<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;

    // 1. Tên bảng (Hãy đảm bảo trong DB tên bảng y hệt như thế này)
    protected $table = 'order_detail';

    // 2. Tắt timestamps nếu bảng này không có cột created_at, updated_at
    public $timestamps = false;

    // 3. Các cột được phép thêm dữ liệu
    protected $fillable = [
        'order_id',
        'product_id',
        'price',
        'qty',
        'amount',
        'discount'
    ];

    /**
     * Quan hệ N - 1: Chi tiết thuộc về 1 Đơn hàng
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    /**
     * Quan hệ N - 1: Chi tiết thuộc về 1 Sản phẩm
     * Hàm này BẮT BUỘC phải có để Controller gọi: with('orderDetails.product')
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
