<?php

namespace App\Console\Commands;

use App\Models\ReverbApp;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AppAddCommand extends Command
{
    protected $signature = 'app:add {name? : The application name}';

    protected $description = 'Create a new Reverb application and output its credentials as JSON';

    public function handle(): int
    {
        $name = $this->argument('name') ?: $this->ask('What is the application name?');

        $app = ReverbApp::firstOrCreate(
            ['name' => $name],
            [
                'key'    => Str::lower(Str::random(20)),
                'secret' => Str::lower(Str::random(20)),
            ],
        );

        $this->line(json_encode([
            'name'   => $app->name,
            'app_id' => $app->id,
            'key'    => $app->key,
            'secret' => $app->secret,
        ], JSON_PRETTY_PRINT));

        return self::SUCCESS;
    }
}
