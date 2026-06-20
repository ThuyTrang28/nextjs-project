<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('banner')->insert([
            'name' => 'Dior Holiday Collection 2025',
            'link' => '/danh-muc/nuoc-hoa',
            'image' => 'uploads/dior/banner_holiday.jpg',
            'sort_order' => 1,
            'position' => 'slideshow',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        DB::table('banner')->insert([
            'name' => 'Capture Totale - Dưỡng da tái tạo',
            'link' => '/san-pham/skincare',
            'image' => 'uploads/dior/banner_skincare.jpg',
            'sort_order' => 2,
            'position' => 'slideshow',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}