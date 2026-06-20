<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;
    
    public $table = 'product_image'; 
    public $timestamps = false; 

    public $fillable = [
        'product_id', 'image', 'sort_order'
    ]; 
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}