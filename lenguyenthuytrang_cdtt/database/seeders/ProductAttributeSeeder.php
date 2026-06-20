<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Lấy IDs của các thuộc tính
        $color_id = DB::table('attribute')->where('name', 'Mã màu')->value('id') ?? 1;
        $size_id = DB::table('attribute')->where('name', 'Dung tích (ml)')->value('id') ?? 2;

        // 2. Lấy ID của sản phẩm thứ nhất (Son 999 Velvet)
        $product_999_id = DB::table('product')->where('name', 'Son Rouge Dior Forever 999 Velvet')->value('id') ?? 1;

        // 3. Lấy ID của sản phẩm thứ hai (Son 840 Rayonnante)
        // GIẢ SỬ MÃ MÀU KHÁC NHAU ĐƯỢC LƯU NHƯ LÀ SẢN PHẨM KHÁC NHAU (biến thể)
        $product_840_id = DB::table('product')->where('name', 'Son Rouge Dior Forever 840 Rayonnante')->value('id') ?? 2; 
        
        // 4. Lấy ID của Kem nền (hoặc bất kỳ sản phẩm nào có dung tích)
        $foundation_id = DB::table('product')->where('name', 'Kem nền Dior')->value('id') ?? 3; // Ví dụ: Kem nền

        $data = [];

        if ($product_999_id) {
            // Chỉ chèn một bản ghi màu cho sản phẩm 999 Velvet
            $data[] = ['product_id' => $product_999_id, 'attribute_id' => $color_id, 'value' => '999 Velvet'];
        }

        if ($product_840_id) {
            // Chèn mã màu 840 cho SẢN PHẨM KHÁC (nếu sản phẩm này tồn tại)
            $data[] = ['product_id' => $product_840_id, 'attribute_id' => $color_id, 'value' => '840 Rayonnante'];
        }
        
        if ($foundation_id) {
            // Dung tích 30ml áp dụng cho Kem nền
            $data[] = ['product_id' => $foundation_id, 'attribute_id' => $size_id, 'value' => '30ml']; 
        }

        // Kiểm tra xem dữ liệu có rỗng không trước khi chèn
        if (! empty($data)) {
            // Dùng phương thức updateOrInsert để tránh lỗi Duplicate (Tùy chọn tốt hơn)
            foreach ($data as $row) {
                 DB::table('product_attribute')->updateOrInsert(
                    // Điều kiện kiểm tra sự tồn tại
                    ['product_id' => $row['product_id'], 'attribute_id' => $row['attribute_id']],
                    // Dữ liệu để cập nhật/chèn
                    ['value' => $row['value']]
                );
            }
        }
    }
}