<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Xóa tất cả các lệnh tạo user mẫu mặc định, thay bằng việc gọi các Seeder tùy chỉnh
        $this->call([
            // 1. Khởi tạo các bảng độc lập trước
            UserSeeder::class, 
            ConfigSeeder::class,
            TopicSeeder::class,
            AttributeSeeder::class,
            
            // 2. Khởi tạo các bảng phụ thuộc
            CategorySeeder::class, 
            PostSeeder::class, // Phụ thuộc vào TopicSeeder, UserSeeder
            ProductSeeder::class,  // Phụ thuộc vào CategorySeeder
            
            // 3. Khởi tạo các bảng chi tiết (order phải trước order_detail)
            OrderSeeder::class,
            OrderDetailSeeder::class,
            
            // 4. Khởi tạo các bảng trung gian/ảnh/sale/menu
            ProductImageSeeder::class,
            ProductSaleSeeder::class,
            ProductAttributeSeeder::class,
            ProductStoreSeeder::class,
            MenuSeeder::class, // Phụ thuộc vào CategorySeeder, PostSeeder
            BannerSeeder::class,
            ContactSeeder::class, // Phụ thuộc vào UserSeeder
        ]);
    }
}
