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
        Schema::create('banner', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->unique(); 
            $table->string('image', 255);
            $table->string('link', 255)->nullable();
            $table->enum('position', ['slideshow', 'ads'])->default('slideshow');
            $table->unsignedInteger('sort_order')->default(0);
            $table->tinyText('description')->nullable();
            $table->unsignedBigInteger('created_by')->default(1);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banner');
    }
};