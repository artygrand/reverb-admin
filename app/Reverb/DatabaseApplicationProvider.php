<?php

namespace App\Reverb;

use App\Models\ReverbApp;
use Illuminate\Support\Collection;
use Laravel\Reverb\Application;
use Laravel\Reverb\Contracts\ApplicationProvider;
use Laravel\Reverb\Exceptions\InvalidApplication;

class DatabaseApplicationProvider implements ApplicationProvider
{
    /**
     * Get all configured applications.
     *
     * @return Collection<Application>
     */
    public function all(): Collection
    {
        return ReverbApp::all()->map(fn (ReverbApp $app) => $this->toApplication($app));
    }

    /**
     * Find an application by its ID.
     *
     * @throws InvalidApplication
     */
    public function findById(string $id): Application
    {
        $app = ReverbApp::find((int) $id);

        if (! $app) {
            throw new InvalidApplication;
        }

        return $this->toApplication($app);
    }

    /**
     * Find an application by its key.
     *
     * @throws InvalidApplication
     */
    public function findByKey(string $key): Application
    {
        $app = ReverbApp::where('key', $key)->first();

        if (! $app) {
            throw new InvalidApplication;
        }

        return $this->toApplication($app);
    }

    private function toApplication(ReverbApp $app): Application
    {
        return new Application(
            (string) $app->id,
            $app->key,
            $app->secret,
            $app->ping_interval,
            $app->activity_timeout,
            $app->allowed_origins,
            $app->max_message_size,
            $app->max_connections,
            $app->accept_client_events_from,
            [
                'enabled'            => $app->rate_limiting_enabled,
                'max_attempts'       => $app->rate_limit_max_attempts,
                'decay_seconds'      => $app->rate_limit_decay_seconds,
                'terminate_on_limit' => $app->rate_limit_terminate,
            ],
        );
    }
}
