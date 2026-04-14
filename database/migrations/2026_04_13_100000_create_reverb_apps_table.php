<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reverb_apps', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('key')->unique();
            $table->string('secret');
            $table->json('allowed_origins')->nullable();
            $table->integer('ping_interval')->default(60);
            $table->integer('activity_timeout')->default(30);
            $table->integer('max_message_size')->default(10000);
            $table->integer('max_connections')->nullable();
            $table->string('accept_client_events_from')->default('members');
            $table->boolean('rate_limiting_enabled')->default(false);
            $table->integer('rate_limit_max_attempts')->default(60);
            $table->integer('rate_limit_decay_seconds')->default(60);
            $table->boolean('rate_limit_terminate')->default(false);
            $table->boolean('log_info')->default(false);
            $table->boolean('log_errors')->default(false);
            $table->boolean('log_messages')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reverb_apps');
    }
};
