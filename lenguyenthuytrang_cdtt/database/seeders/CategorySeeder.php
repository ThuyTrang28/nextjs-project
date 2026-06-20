<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Khai báo các giá trị chung để đảm bảo tính nhất quán
        $common_fields = [
            'description' => 'Danh mục sản phẩm cao cấp.',
            'created_by' => 1,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 1. CHÈN VÀ LƯU IDs DANH MỤC CẤP CHA
        $parent_categories_raw = [
            'Trang điểm (Makeup)' => ['parent_id' => 0, 'sort_order' => 1],
            'Dưỡng da (Skincare)' => ['parent_id' => 0, 'sort_order' => 2],
            'Nước hoa (Fragrance)' => ['parent_id' => 0, 'sort_order' => 3],
        ];

        $parent_ids = [];

        // Chèn từng danh mục cha VÀ gán slug/timestamp/các trường khác
        foreach ($parent_categories_raw as $name => $fields) {
            $data = array_merge($fields, $common_fields, [
                'name' => $name,
                'slug' => Str::slug($name),
            ]);

            // Sử dụng insertGetId() để chèn và lấy ID vừa tạo ra
            $id = DB::table('category')->insertGetId($data);
            
            // Lưu ID vào mảng để dùng cho danh mục con
            $parent_ids[$name] = $id;
        }

        // Lấy IDs của các danh mục cha để sử dụng
        $parent1_id = $parent_ids['Trang điểm (Makeup)'] ?? null;
        $parent2_id = $parent_ids['Dưỡng da (Skincare)'] ?? null;
        
        // 2. CHÈN DANH MỤC CẤP CON (chỉ chạy nếu tìm thấy ID cha)
        $sub_categories_raw = [];

        if ($parent1_id) {
            $sub_categories_raw[] = ['name' => 'Son môi Dior', 'parent_id' => $parent1_id, 'sort_order' => 1];
            $sub_categories_raw[] = ['name' => 'Kem nền Dior', 'parent_id' => $parent1_id, 'sort_order' => 2];
        }

        if ($parent2_id) {
            $sub_categories_raw[] = ['name' => 'Serum', 'parent_id' => $parent2_id, 'sort_order' => 1];
            $sub_categories_raw[] = ['name' => 'Kem chống nắng', 'parent_id' => $parent2_id, 'sort_order' => 2];
        }
        
        $sub_categories_to_insert = [];

        // Chuẩn bị dữ liệu cho tất cả danh mục con
        foreach ($sub_categories_raw as $category) {
            $data = array_merge($category, $common_fields, [
                'slug' => Str::slug($category['name']),
                'description' => 'Sản phẩm ' . $category['name'] . ' cao cấp từ Dior.',
            ]);
            $sub_categories_to_insert[] = $data;
        }
        
        // Chèn tất cả danh mục con bằng một lệnh insert duy nhất (tối ưu hiệu suất)
        if (! empty($sub_categories_to_insert)) {
             DB::table('category')->insert($sub_categories_to_insert);
        }
    }
}