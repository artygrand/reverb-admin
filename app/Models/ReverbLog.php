<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReverbLog extends Model
{
    public const null UPDATED_AT = null;

    protected $fillable = ['app_id', 'type', 'content'];

    public const string TYPE_INFO    = 'info';
    public const string TYPE_ERROR   = 'error';
    public const string TYPE_MESSAGE = 'message';
}
