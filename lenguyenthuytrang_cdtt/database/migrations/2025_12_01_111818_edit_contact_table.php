<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact', function (Blueprint $table) {
            // Thêm cột title (sau cột phone)
            $table->string('title', 255)->after('phone'); 
        });
    }

    public function down(): void
    {
        Schema::table('contact', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
