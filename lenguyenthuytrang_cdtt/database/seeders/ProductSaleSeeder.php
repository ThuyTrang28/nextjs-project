<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy ID của sản phẩm thứ 1 (Son Rouge Dior)
        $product_id = DB::table('product')->first()->id ?? 1;
        $price_buy = DB::table('product')->where('id', $product_id)->value('price_buy') ?? 1000000;
        
        // Giảm 15% cho Son môi
        $price_sale = $price_buy * 0.85;

        DB::table('product_sale')->insert([
            'name' => 'Ưu đãi Lễ hội cuối năm Dior',
            'product_id' => $product_id,
            'price_sale' => $price_sale,
            'date_begin' => now(),
            'date_end' => now()->addDays(15),
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}