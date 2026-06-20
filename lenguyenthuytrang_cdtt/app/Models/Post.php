<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;
    
    // Laravel tự động thêm prefix 'lntt_' nên chỉ cần khai báo tên gốc
    public $table = 'post'; 
    
    public $fillable = [
        'topic_id', 
        'title', 
        'slug', 
        'image', 
        'content',      // Trong ảnh là 'content', code cũ là 'detail' -> Đã sửa
        'description',  // Trong ảnh có cột này
        'post_type',    // Trong ảnh là 'post_type', code cũ là 'type' -> Đã sửa
        'created_by', 
        'updated_by', 
        'status'
    ]; 
    
    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id', 'id');
    }
}