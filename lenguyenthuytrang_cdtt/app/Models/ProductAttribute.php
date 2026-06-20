<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory;
    
   
    public $table = 'product_attribute'; 
    public $timestamps = false; 

    public $fillable = [
        'product_id', 'attribute_id', 'value' 
    ]; 
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
    
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id', 'id');
    }
}