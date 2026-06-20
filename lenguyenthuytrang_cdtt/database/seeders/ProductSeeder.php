<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $category_id = DB::table('category')->where('name', 'Son môi Dior')->value('id') ?? 4;
        $products_data = [
            'Son Rouge Dior Forever 999 Velvet',
            'Kem Nền Diorskin Forever Matte 1N',
            'Nước Hoa J\'adore EDP 50ml',
            'Dior Capture Totale Serum',
        ];

        foreach ($products_data as $index => $product_name) {
            $price_buy = rand(800000, 2500000); // Giá sản phẩm cao cấp

            DB::table('product')->insert([
                'category_id' => $category_id,
                'name' => $product_name,
                'slug' => Str::slug($product_name),
                'thumbnail' => 'uploads/dior/product_' . ($index + 1) . '.jpg',
                'content' => 'Nội dung chi tiết: Sản phẩm mỹ phẩm cao cấp từ Dior, kết cấu mịn, lâu trôi.',
                'description' => 'Mô tả ngắn gọn về sản phẩm Dior ' . $product_name . '.',
                'price_buy' => $price_buy,
                'created_by' => 1,
                'updated_by' => null,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}