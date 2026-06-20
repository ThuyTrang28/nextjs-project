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
        Schema::create('menu', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('link', 255);
            $table->enum('type', ['category', 'page', 'topic', 'custom']);
            $table->unsignedBigInteger('parent_id')->default(0); 
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedBigInteger('table_id')->nullable(); 
            $table->enum('position', ['mainmenu', 'footermenu']);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->default(1);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedTinyInteger('status')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu');
    }
};