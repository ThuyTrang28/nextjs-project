<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $topic_id = DB::table('topic')->where('name', 'Đánh giá Son Dior')->value('id') ?? 3;

        // 1. Bài viết (Post)
        $post_title = 'Review chi tiết Son Dior 999 Velvet: Đẳng cấp và bền màu';
        DB::table('post')->insert([
            'topic_id' => $topic_id,
            'title' => $post_title,
            'slug' => Str::slug($post_title),
            'image' => 'uploads/dior/post_son.jpg',
            'content' => 'Nội dung chi tiết về chất son, màu sắc và cảm nhận khi sử dụng... (longText)',
            'description' => 'Đánh giá son Dior 999 - Màu đỏ huyền thoại.',
            'post_type' => 'post',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // 2. Trang tĩnh (Page)
        $page_title = 'Chương trình khách hàng thân thiết Sephora Gold';
        DB::table('post')->insert([
            'topic_id' => null,
            'title' => $page_title,
            'slug' => Str::slug($page_title),
            'image' => '',
            'content' => 'Nội dung chi tiết về các quyền lợi của thành viên Sephora Gold.',
            'description' => 'Ưu đãi và đặc quyền dành cho khách hàng thân thiết.',
            'post_type' => 'page',
            'created_by' => 1,
            'updated_by' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}