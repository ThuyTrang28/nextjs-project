<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductStoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = DB::table('product')->take(4)->get();

        foreach ($products as $product) {
            DB::table('product_store')->insert([
                'product_id' => $product->id,
                'price_root' => $product->price_buy * 0.75, 
                'qty' => rand(30, 100), 
                'created_by' => 1,
                'updated_by' => null,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}