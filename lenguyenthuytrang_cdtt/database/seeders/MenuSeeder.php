<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy ID của danh mục "Son môi Dior"
        $category_id = DB::table('category')->where('name', 'Son môi Dior')->value('id') ?? 4;
        // Lấy ID của trang tĩnh "Chương trình khách hàng thân thiết"
        $page_id = DB::table('post')->where('post_type', 'page')->value('id') ?? 2;

        $menus = [
            [
                'name' => 'Trang chủ', 'link' => '/', 'type' => 'custom', 'parent_id' => 0, 'sort_order' => 1, 'table_id' => null, 'position' => 'mainmenu',
            ],
            [
                'name' => 'Makeup Dior', 'link' => '/san-pham/makeup', 'type' => 'custom', 'parent_id' => 0, 'sort_order' => 2, 'table_id' => null, 'position' => 'mainmenu',
            ],
            [
                'name' => 'Son môi (Dior)', 'link' => '/danh-muc/' . $category_id, 'type' => 'category', 'parent_id' => DB::table('menu')->where('name', 'Makeup Dior')->value('id') ?? 2, 'sort_order' => 1, 'table_id' => $category_id, 'position' => 'mainmenu',
            ],
            [
                'name' => 'Sephora VIP', 'link' => '/trang/' . $page_id, 'type' => 'page', 'parent_id' => 0, 'sort_order' => 1, 'table_id' => $page_id, 'position' => 'footermenu',
            ],
        ];

        foreach ($menus as $menu) {
            DB::table('menu')->insert([
                'name' => $menu['name'],
                'link' => $menu['link'],
                'type' => $menu['type'],
                'parent_id' => $menu['parent_id'],
                'sort_order' => $menu['sort_order'],
                'table_id' => $menu['table_id'],
                'position' => $menu['position'],
                'created_by' => 1,
                'updated_by' => null,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}