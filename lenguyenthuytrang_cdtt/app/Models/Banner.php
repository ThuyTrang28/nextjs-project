<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;
    
    // Đã thay protected bằng public theo yêu cầu
    public $table = 'banner'; 
    
    public $fillable = [
        'name', 'image', 'link', 'position', 'sort_order', 
        'description', 'status', 'created_by', 'updated_by'
    ]; 
}