<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menu'; // Dùng protected theo chuẩn Laravel

    protected $fillable = [
        'name',
        'link',
        'type',
        'parent_id',
        'sort_order',
        'table_id',
        'position',
        'status', // Bạn nên thêm trường status để ẩn/hiện menu
        'created_by',
        'updated_by'
    ];

    /**
     * Lấy các menu con
     */
    public function children()
    {
        // Thêm orderBy để lúc nào lấy con cũng đúng thứ tự số thứ tự
        return $this->hasMany(Menu::class, 'parent_id', 'id')
                    ->orderBy('sort_order', 'asc');
    }

    /**
     * Lấy menu cha
     */
    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id', 'id')
                    ->withDefault(['name' => 'Không có']); // Tránh lỗi null khi gọi $menu->parent->name
    }
}
