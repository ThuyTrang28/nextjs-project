<?php

namespace App\Models;

// 👇 1. THÊM DÒNG NÀY ĐỂ KÍCH HOẠT TÍNH NĂNG XÁC THỰC EMAIL
use Illuminate\Contracts\Auth\MustVerifyEmail;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// 👇 2. THÊM "implements MustVerifyEmail" VÀO SAU "Authenticatable"
class User extends Authenticatable implements MustVerifyEmail
{
    // Đã có HasApiTokens để dùng cho API Login
    use HasApiTokens, HasFactory, Notifiable;

    // Giữ nguyên cấu hình bảng của bạn
    public $table = 'user';

    public $fillable = [
        'name', 'email', 'phone', 'username', 'password', 'roles', 'avatar', 'status',
        'created_by', 'updated_by'
    ];

    public $hidden = [
        'password',
        'remember_token',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }
}
