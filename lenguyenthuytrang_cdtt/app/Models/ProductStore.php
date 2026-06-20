<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductStore extends Model
{
    use HasFactory;
    
    public $table = 'product_store'; 
    
    public $fillable = [
        'product_id', 
        'price_root', 
        'qty', 
        'status', // <--- THÊM DÒNG NÀY VÀO
        'created_by', 
        'updated_by'
    ]; 
    
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}