<?php

namespace App\Console\Commands;

use App\Models\ReverbApp;
use App\Models\ReverbLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class AppDeleteCommand extends Command
{
    protected $signature = 'app:delete {name? : The application name}';

    protected $description = 'Delete a Reverb application and restart the Reverb server';

    public function handle(): int
    {
        $name = $this->argument('name') ?: $this->ask('What is the application name?');

        $app = ReverbApp::where('name', $name)->first();

        if (! $app) {
            $this->error("Application '$name' not found.");

            return self::FAILURE;
        }

        $app->delete();

        $this->info("Application '$name' deleted.");

        // Restart Reverb so the deleted app is no longer served
        Artisan::call('reverb:restart');
        $this->info('Reverb server restart signal sent.');

        return self::SUCCESS;
    }
}
