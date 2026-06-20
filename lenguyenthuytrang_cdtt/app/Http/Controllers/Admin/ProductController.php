<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductStore;
use App\Models\ProductSale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Hiển thị danh sách sản phẩm (sử dụng phân trang tự động).
     */
    public function product_new(Request $request)
    {
        $now = now();
        $limit = $request->limit ?? 10;

        $productStore = ProductStore::query()
        ->select('product_id',DB::raw('SUM(qty) AS product_qty'))
        ->groupBy('product_id');
        // ->get(); bo

        $productSale = ProductSale::query()
        ->select('id','product_id','price_sale')
        ->where('date_begin','<=',$now)
        ->where('date_end','>=',$now);
        // ->get(); //bor

        $products = Product::query()
        ->joinSub($productStore,'ps', function($queryPS){
            $queryPS->on('ps.product_id', '=', 'product.id')
            ->where('ps.product_qty','>',0);
        })
        // joinSub --> KM
        // leftJoinSub
        ->leftJoinSub($productSale,'psale', function($querySale){
            $querySale->on('psale.product_id', '=', 'product.id');
        })
        ->select('product.id','product.name','product.price_buy','psale.price_sale')
        ->with('images')
        ->orderBy('product.created_at','DESC')
        ->limit($limit)
        ->get();

        foreach($products as $p)
        {
            echo $p->name."GB: ".$p->price_buy." Gia KM:".$p->price_sale;
            echo "<hr>";
        }
    }

    public function index(Request $request)
    {
        try {
            $query = Product::query()
                ->select(
                    'product.id',
                    'product.name',
                    'category.name as category',
                    'product.price_buy as price',
                    'product_store.qty as stock',
                    'product.status',
                    'product.thumbnail',
                    'product.description' // <--- THÊM DÒNG NÀY (hoặc 'product.content')
                )
                ->join('category', 'category.id', '=', 'product.category_id')
                // 2. QUAN TRỌNG: Đổi thành leftJoin để sản phẩm mới chưa có kho vẫn hiện ra
                ->leftJoin('product_store', 'product_store.product_id', '=', 'product.id')
                ->orderBy('product.created_at', 'desc');

            // Tìm kiếm
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('product.name', 'like', '%' . $search . '%');
            }

            // Lọc theo Danh mục
            if ($request->has('category')) {
                if(is_numeric($request->category)) {
                     $query->where('product.category_id', $request->category);
                } else {
                     $query->where('category.name', $request->category);
                }
            }

            // Phân trang tự động
            $limit = $request->input('limit', 10);
            $products = $query->paginate($limit);

            return response()->json([
                'status' => true,
                'data' => $products,
                'message' => 'Tải dữ liệu thành công',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi tải dữ liệu sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu trữ một sản phẩm mới (CREATE).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:category,id',
            'name' => 'required|string|max:255',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content' => 'required|string',
            'price_buy' => 'required|numeric',
            'status' => 'required|integer|in:1,2',
            'qty' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi validation',
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction(); // Bắt đầu Transaction

            $data = $request->except(['thumbnail', 'images', 'qty']); // Loại bỏ qty để xử lý riêng bên bảng store
            $data['slug'] = $request->slug ? Str::slug($request->slug) : Str::slug($request->name) . '-' . time();
            $data['created_by'] = Auth::id() ?? 1;

            // 1. Xử lý File Thumbnail chính
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('images/products/thumbnail', $filename, 'public');
                $data['thumbnail'] = $path;
            }

            // 2. Tạo sản phẩm chính
            $product = Product::create($data);

            // 3. QUAN TRỌNG: Tạo dữ liệu kho (ProductStore)
            // Nếu không có bước này, JOIN bên index sẽ bị thiếu dữ liệu
            ProductStore::create([
                'product_id' => $product->id,
                'qty' => $request->qty,
                'price_root' => $product->price_buy, // <--- SỬA THÀNH price_root
                'created_by' => $data['created_by']
            ]);
            // 4. Xử lý Ảnh phụ
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $imageFile) {
                    $imageFilename = time() . '_' . $imageFile->getClientOriginalName();
                    $imagePath = $imageFile->storeAs('images/products/details', $imageFilename, 'public');

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imagePath,
                    ]);
                }
            }

            DB::commit(); // Hoàn tất Transaction

            return response()->json([
                'status' => true,
                'data' => $product,
                'message' => 'Thêm sản phẩm và nhập kho thành công',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Hoàn tác nếu có lỗi
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi thêm sản phẩm',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết một sản phẩm (READ).
     */
    public function show($id)
    {
        try {
            // 1. Chỉ lấy các quan hệ cơ bản đã được định nghĩa chắc chắn trong Model Product
            // Bỏ 'sales' (vì không tồn tại)
            // Bỏ 'attributes' (tạm thời bỏ để tránh lỗi nếu chưa có bảng pivot, sau này code xong bảng đó thì thêm lại sau)
            $product = Product::with(['category', 'images', 'store'])
                              ->find($id);

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $product,
                'message' => 'Tải chi tiết sản phẩm thành công',
            ], 200);

        } catch (\Exception $e) {
            // Ghi log lỗi để debug nếu vẫn bị 500
            \Illuminate\Support\Facades\Log::error("Lỗi xem chi tiết sản phẩm: " . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Lỗi Server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật một sản phẩm (UPDATE).
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm để cập nhật',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|integer|exists:category,id',
            'name' => 'sometimes|required|string|max:255',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'price_buy' => 'sometimes|required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi validation',
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $request->except(['thumbnail', 'images', 'qty']);
            $data['updated_by'] = Auth::id() ?? ($product->updated_by ?? 1);

            // 1. Xử lý File Thumbnail mới
            if ($request->hasFile('thumbnail')) {
                if ($product->thumbnail && Storage::disk('public')->exists($product->thumbnail)) {
                    Storage::disk('public')->delete($product->thumbnail);
                }
                $file = $request->file('thumbnail');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('images/products/thumbnail', $filename, 'public');
                $data['thumbnail'] = $path;
            }

            // 2. Cập nhật sản phẩm chính
            $product->update($data);

            // 3. Cập nhật tồn kho (Nếu có gửi qty lên)
            if ($request->has('qty')) {
                $store = ProductStore::where('product_id', $product->id)->first();
                if ($store) {
                    $store->update(['qty' => $request->qty, 'updated_by' => $data['updated_by']]);
                } else {
                    // Nếu chưa có thì tạo mới (phòng trường hợp data cũ bị thiếu)
                    ProductStore::create([
                        'product_id' => $product->id,
                        'qty' => $request->qty,
                        'created_by' => $data['updated_by']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => $product,
                'message' => 'Cập nhật sản phẩm thành công',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật sản phẩm',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa một sản phẩm (DELETE).
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm để xóa',
            ], 404);
        }

        try {
            DB::beginTransaction();

            // 1. Xóa các bảng phụ trước
            $product->images()->delete();
            // Nếu có thiết lập cascade ở DB thì không cần dòng này, nhưng an toàn thì cứ để
            ProductStore::where('product_id', $id)->delete();

            // 2. Xóa File ảnh
            if ($product->thumbnail && Storage::disk('public')->exists($product->thumbnail)) {
                Storage::disk('public')->delete($product->thumbnail);
            }

            // 3. Xóa sản phẩm chính
            $product->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xóa sản phẩm và dữ liệu liên quan thành công',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
