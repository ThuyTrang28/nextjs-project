<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy ID của user khách hàng VIP (Giả sử ID = 2)
        $user_id = DB::table('user')->where('email', 'vipcustomer1@sephora.com')->value('id') ?? 2;

        DB::table('order')->insert([
            'user_id' => $user_id,
            'name' => 'Phạm Thị Cúc',
            'email' => 'phamcuc@vip.com',
            'phone' => '0912345678',
            'address' => '456 Hai Bà Trưng, Quận 3, TP.HCM',
            'note' => 'Yêu cầu gói quà cao cấp của Sephora.',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1, // 1: Chờ xử lý
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}