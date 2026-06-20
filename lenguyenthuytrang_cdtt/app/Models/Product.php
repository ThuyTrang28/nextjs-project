<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'product';

    protected $fillable = [
        'category_id', 'name', 'slug', 'thumbnail', 'content', 'description', 'price_buy', 
        'qty', 'status', 'created_by', 'updated_by',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id');
    }
    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'lntt_product_attribute', 'product_id', 'attribute_id')
                    ->withPivot('value'); 
    }
    public function store()
    {
        return $this->hasOne(ProductStore::class, 'product_id', 'id');
    }
}