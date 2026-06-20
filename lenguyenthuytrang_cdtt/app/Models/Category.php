<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    
    public $table = 'category'; 
    
    public $fillable = [
        'name', 'slug', 'image', 'parent_id', 'sort_order', 'description', 
        'created_by', 'updated_by', 'status'
    ]; 
    
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }
    
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id', 'id');
    }
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id', 'id');
    }
}