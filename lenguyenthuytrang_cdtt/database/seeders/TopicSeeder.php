<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TopicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $topics = [
            'Xu hướng Trang điểm',
            'Bí quyết Dưỡng da',
            'Đánh giá Son Dior',
            'Sự kiện & Ra mắt Sản phẩm mới',
        ];

        foreach ($topics as $topic) {
            DB::table('topic')->insert([
                'name' => $topic,
                'slug' => Str::slug($topic),
                'sort_order' => 0,
                'description' => 'Các bài viết thuộc chủ đề ' . $topic,
                'created_by' => 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}