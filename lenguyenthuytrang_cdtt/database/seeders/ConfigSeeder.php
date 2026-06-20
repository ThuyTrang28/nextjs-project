<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('config')->insert([
            'site_name' => 'Sephora | Dior Beauty Vietnam',
            'email' => 'support@sephora.vn',
            'phone' => '02473000999',
            'hotline' => '1900 6688',
            'address' => '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            'status' => 1,
        ]);
    }
}