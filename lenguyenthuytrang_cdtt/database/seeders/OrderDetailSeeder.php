<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $order_id = DB::table('order')->value('id');
        
        // Lấy ID và giá của Son Rouge Dior và Nước Hoa J'adore
        $products = DB::table('product')
                    ->whereIn('name', ['Son Rouge Dior Forever 999 Velvet', 'Nước Hoa J\'adore EDP 50ml'])
                    ->get(['id', 'price_buy']);

        if ($order_id && $products->isNotEmpty()) {
            foreach ($products as $product) {
                $qty = 1;
                $price = $product->price_buy; 
                $discount_rate = ($product->id % 2 == 0) ? 0.05 : 0; // Giảm 5% cho Nước Hoa
                $discount = $price * $discount_rate;
                $amount = ($price - $discount) * $qty;

                DB::table('order_detail')->insert([
                    'order_id' => $order_id,
                    'product_id' => $product->id,
                    'price' => $price,
                    'qty' => $qty,
                    'amount' => $amount,
                    'discount' => $discount,
                ]);
            }
        }
    }
}