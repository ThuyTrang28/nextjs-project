<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;
    
    public $table = 'attribute'; 

    public $fillable = [
        'name', 'slug', 'status', 'created_by', 'updated_by'
    ]; 
    
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attribute', 'attribute_id', 'product_id')
                    ->withPivot('value'); 
    }
}