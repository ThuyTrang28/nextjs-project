<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tài khoản Admin (Quản lý Sephora/Dior)
        DB::table('user')->insert([
            'name' => 'Quản Lý Dior',
            'email' => 'admin@sephora.com',
            'phone' => '0901234567',
            'username' => 'dior_admin',
            'password' => Hash::make('123456'), 
            'roles' => 'admin',
            'created_by' => 1,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Tài khoản Khách hàng VIP
        for ($i = 2; $i <= 5; $i++) {
            DB::table('user')->insert([
                'name' => 'Khách hàng VIP ' . ($i-1),
                'email' => 'vipcustomer' . ($i-1) . '@sephora.com',
                'phone' => '090' . Str::random(7),
                'username' => 'vip_user_' . ($i-1),
                'password' => Hash::make('123456'),
                'roles' => 'customer',
                'created_by' => 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}