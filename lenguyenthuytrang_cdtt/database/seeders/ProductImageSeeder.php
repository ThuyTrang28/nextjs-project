<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $product_ids = DB::table('product')->take(2)->pluck('id');

        foreach ($product_ids as $product_id) {
            for ($i = 1; $i <= 3; $i++) {
                DB::table('product_image')->insert([
                    'product_id' => $product_id,
                    'image' => 'uploads/dior/detail_' . $product_id . '_' . $i . '.jpg',
                    'alt' => 'Góc chụp sản phẩm Dior ' . $i,
                    'title' => 'Dior Product ' . $product_id . ' - Image ' . $i,
                ]);
            }
        }
    }
}