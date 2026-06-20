<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order', function (Blueprint $table) {
            $table->string('payment_method', 20)->default('cod')->after('status');
            $table->decimal('total_amount', 12, 2)->default(0)->after('payment_method');
            $table->string('payment_status', 20)->default('unpaid')->after('total_amount');
            $table->string('vnp_txn_ref', 50)->nullable()->unique()->after('payment_status');
            $table->timestamp('paid_at')->nullable()->after('vnp_txn_ref');
        });
    }

    public function down(): void
    {
        Schema::table('order', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'total_amount', 'payment_status', 'vnp_txn_ref', 'paid_at']);
        });
    }
};
