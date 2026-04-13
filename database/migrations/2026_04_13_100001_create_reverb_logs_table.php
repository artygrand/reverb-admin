<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reverb_logs', function (Blueprint $table) {
            $table->id();
            $table->string('app_id')->nullable()->index();
            $table->string('type'); // info | error | message
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reverb_logs');
    }
};
