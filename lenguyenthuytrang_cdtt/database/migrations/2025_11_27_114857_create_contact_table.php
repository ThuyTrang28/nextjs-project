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
        Schema::create('contact', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); 
            $table->string('name', 100);
            $table->string('email', 100);
            $table->string('phone', 20);
            $table->mediumText('content');
            $table->unsignedBigInteger('reply_id')->default(0); 
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->default(1);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedTinyInteger('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact');
    }
};