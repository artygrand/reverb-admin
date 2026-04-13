<?php

namespace App\Providers;

use App\Listeners\ReverbEventLogger;
use App\Reverb\DatabaseApplicationProvider;
use App\Reverb\DatabaseLogger;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Reverb\ApplicationManager;
use Laravel\Reverb\Contracts\Logger;
use Laravel\Reverb\Events\ChannelCreated;
use Laravel\Reverb\Events\ChannelRemoved;
use Laravel\Reverb\Events\ConnectionPruned;
use Laravel\Reverb\Events\MessageReceived;
use Laravel\Reverb\Events\MessageSent;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Override Reverb's NullLogger instance (set in ReverbServiceProvider::register)
        // boot() runs after all register() calls, so this wins.
        $this->app->instance(Logger::class, new DatabaseLogger);

        $this->configureDefaults();
        $this->registerReverbDatabaseDriver();
        $this->registerReverbEventListeners();
        $this->configurePulseAccess();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function registerReverbDatabaseDriver(): void
    {
        // Use resolving() so the driver is registered when ApplicationManager is first created
        $this->app->resolving(ApplicationManager::class, function (ApplicationManager $manager) {
            $manager->extend('database', fn () => new DatabaseApplicationProvider);
        });
    }

    protected function registerReverbEventListeners(): void
    {
        Event::listen(ChannelCreated::class,   [ReverbEventLogger::class, 'handleChannelCreated']);
        Event::listen(ChannelRemoved::class,   [ReverbEventLogger::class, 'handleChannelRemoved']);
        Event::listen(ConnectionPruned::class, [ReverbEventLogger::class, 'handleConnectionPruned']);
        Event::listen(MessageReceived::class,  [ReverbEventLogger::class, 'handleMessageReceived']);
        Event::listen(MessageSent::class,      [ReverbEventLogger::class, 'handleMessageSent']);
    }

    protected function configurePulseAccess(): void
    {
        Gate::define('viewPulse', fn ($user) => true);
    }
}
