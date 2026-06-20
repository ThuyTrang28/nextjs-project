<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('category', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('image', 255)->nullable();
            $table->unsignedBigInteger('parent_id')->default(0); 
            $table->unsignedInteger('sort_order')->default(0);
            $table->tinyText('description')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->default(1);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedTinyInteger('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category');
    }
};