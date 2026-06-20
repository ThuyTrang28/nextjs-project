<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;
    
    public $table = 'topic'; 
    
    public $fillable = [
        'name', 'slug', 'sort_order', 'description', 
        'status', 'created_by', 'updated_by'
    ]; 
    public function posts()
    {
        return $this->hasMany(Post::class, 'topic_id', 'id');
    }
}