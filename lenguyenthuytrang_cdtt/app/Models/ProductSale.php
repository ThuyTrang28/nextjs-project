<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSale extends Model
{
    use HasFactory;
    
    // Đảm bảo tên bảng đúng (số nhiều hay số ít tùy DB của bạn)
    protected $table = 'product_sale'; 

    protected $fillable = [
        'name',          // <--- THÊM DÒNG NÀY VÀO ĐẦU TIÊN
        'product_id', 
        'price_sale', 
        'date_begin', 
        'date_end', 
        'created_by', 
        'updated_by'
    ]; 

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}