<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy ID của user khách hàng VIP
        $user_id = DB::table('user')->where('email', 'vipcustomer1@sephora.com')->value('id') ?? 2;

        DB::table('contact')->insert([
            'user_id' => $user_id,
            'name' => 'Trần Văn Dũng',
            'email' => 'trandung@vip.com',
            'phone' => '0987654321',
            'title' => 'Yêu cầu tư vấn tone Kem nền Dior',
            'content' => 'Tôi muốn được tư vấn để chọn tone màu Kem Nền Diorskin Forever Matte phù hợp với tone da.',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}