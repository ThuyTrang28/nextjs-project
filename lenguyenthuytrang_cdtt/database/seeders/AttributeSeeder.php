<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributes = ['Mã màu', 'Dung tích (ml)', 'Tone da'];

        foreach ($attributes as $attribute) {
            DB::table('attribute')->insert([
                'name' => $attribute,
            ]);
        }
    }
}