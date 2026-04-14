<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class ReverbApp extends Model
{
    protected $attributes = [
        'allowed_origins' => '["*"]',
    ];

    protected $fillable = [
        'name',
        'key',
        'secret',
        'allowed_origins',
        'ping_interval',
        'activity_timeout',
        'max_message_size',
        'max_connections',
        'accept_client_events_from',
        'rate_limiting_enabled',
        'rate_limit_max_attempts',
        'rate_limit_decay_seconds',
        'rate_limit_terminate',
        'log_info',
        'log_errors',
        'log_messages',
    ];

    protected $casts = [
        'allowed_origins'         => 'array',
        'rate_limiting_enabled'   => 'boolean',
        'rate_limit_terminate'    => 'boolean',
        'log_info'                => 'boolean',
        'log_errors'              => 'boolean',
        'log_messages'            => 'boolean',
    ];

    /**
     * Expose app_id as an alias for id so Reverb-related code stays readable.
     */
    protected function appId(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->id,
        );
    }

    protected static function booted(): void
    {
        static::deleting(function (ReverbApp $app) {
            ReverbLog::where('app_id', $app->id)->delete();
        });
    }
}
