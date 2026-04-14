<?php

use App\Http\Controllers\Apps\AppBroadcastAuthController;
use App\Http\Controllers\Apps\AppController;
use App\Http\Controllers\Apps\AppDebugController;
use App\Http\Controllers\Apps\AppLogsController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('projects')
        ->name('projects.')
        ->group(function () {
            Route::get('{app}', [AppController::class, 'show'])->name('show');
            Route::post('{app}/debug', [AppDebugController::class, 'store'])->name('debug');
            Route::post('{app}/broadcasting/auth', AppBroadcastAuthController::class)->name('broadcasting.auth');
            Route::get('{app}/logs', [AppLogsController::class, 'index'])->name('logs');
            Route::delete('{app}/logs', [AppLogsController::class, 'destroy'])->name('logs.destroy');
            Route::patch('{app}/logs/settings', [AppLogsController::class, 'updateSettings'])->name('logs.settings');
        });
});

require __DIR__ . '/settings.php';
