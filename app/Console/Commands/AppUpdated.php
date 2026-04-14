<?php

namespace App\Console\Commands;

use App\Events\AppUpdated as Event;
use Illuminate\Console\Command;

class AppUpdated extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:updated';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify all users that the app has been updated';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Event::dispatch();
    }
}
