# AGENTS.md - AI Coding Guide for Reverb Admin

## Project Overview

**Reverb Admin** is a Laravel + React admin panel for managing WebSocket applications powered by [Laravel Reverb](https://reverb.laravel.com). The stack combines:
- **Backend**: Laravel 13 + Reverb (WebSocket server framework)
- **Frontend**: React 19 + TypeScript with Inertia.js (SSR-enabled)
- **UI**: Tailwind CSS + shadcn/ui components + Radix UI primitives
- **Testing**: Pest PHP (backend) + ESLint/TypeScript (frontend)

**Core Purpose**: Provide a dashboard to monitor and debug Reverb WebSocket connections, applications, and messages in real-time.

---

## Architecture & Data Flows

### Key Components

1. **Reverb Integration Layer** (`app/Reverb/`)
   - `DatabaseApplicationProvider`: Custom application provider that loads Reverb apps from the database instead of config files. Implements `ApplicationProvider` contract.
   - `DatabaseLogger`: Custom logger that persists Reverb server events to database instead of using the default NullLogger

2. **Event Logging System** (`app/Listeners/ReverbEventLogger.php`)
   - Listens to 5 core Reverb events: `ChannelCreated`, `ChannelRemoved`, `ConnectionPruned`, `MessageReceived`, `MessageSent`
   - Respects per-app logging flags: `log_info`, `log_errors`, `log_messages`
   - **Critical**: All database and broadcast operations are wrapped in try-catch to never break the WebSocket server
   - Broadcasts debug events using **direct Pusher calls per app** (not the global Laravel broadcaster) — each app's own `key`/`secret` is used so events land in the correct app namespace on Reverb
   - Channel: `private-reverb-admin-debug.{app_id}`, event: `debug.event`
   - Pusher connection options read from `config('broadcasting.connections.reverb.options')` — never hardcoded

3. **Data Models**
   - `ReverbApp`: Stores configured applications with full Reverb settings (origins, timeouts, rate limits, etc.)
   - `ReverbLog`: Append-only log (no `updated_at`) with type constants: `TYPE_INFO`, `TYPE_ERROR`, `TYPE_MESSAGE`

4. **Frontend Architecture** (Inertia.js)
   - **Layout switching** in `resources/js/app.tsx`: Auth pages use `AuthLayout`, settings use nested `[AppLayout, SettingsLayout]`, others use `AppLayout`
   - **Echo integration**: Global Echo configured with bare `configureEcho({ broadcaster: 'reverb' })` — `@laravel/echo-react` auto-reads all `VITE_REVERB_*` env vars as defaults
   - **Per-app Echo** in `apps/show.tsx`: Debug console creates a dedicated `Echo` instance per selected app using that app's `key`, pointing to the same Reverb server with a custom `authEndpoint`
   - **Real-time updates**: Private channel subscriptions in page components listen to `debug.event`

### Data Flow: WebSocket Event → Admin Panel

```
Reverb Server Event (e.g., MessageReceived)
  ↓
ReverbEventLogger::handleMessageReceived()
  ├→ Saves to ReverbLog table (if log_messages enabled)
  └→ new Pusher(app->key, app->secret, ..., reverb options)
       →  triggers 'private-reverb-admin-debug.{app_id}' / 'debug.event'
            ↓  (in that app's Reverb namespace)
            Frontend per-app Echo (key=app.key, authEndpoint=/apps/{id}/broadcasting/auth)
              .private('reverb-admin-debug.{app.id}').listen('.debug.event', handleEvent)
                ↓
                React component state update → UI re-render
```

---

## Critical Developer Workflows

### Local Development

```bash
# Initial setup
composer setup

# Watch mode (runs 4 concurrent processes with colored output):
# - Laravel server on :8000
# - Queue listener (with 1 retry)
# - Pail logs (real-time logs)
# - Vite dev server
composer dev

# Available scripts
npm run dev              # Vite dev server
npm run build            # Vite production build
npm run build:ssr        # Build with SSR support
npm run lint             # ESLint auto-fix
npm run format           # Prettier auto-format (resources only)
npm run types:check      # TypeScript check
php artisan serve        # Laravel dev server
php artisan reverb:start # Start Reverb server
```

### Testing & CI

```bash
# Backend tests (Pest)
php artisan test

# Linting & formatting checks
php artisan lint:check   # PHP (Pint)
npm run lint:check       # JavaScript/TypeScript
npm run format:check     # Prettier check

# Full CI suite (what GitHub Actions runs)
composer ci:check        # Runs: JS lint/format, TS types, PHP tests

# Individual checks
npm run types:check      # Catch TypeScript errors early
pint --parallel          # Format PHP files
```

### Configuration Access

The project uses environment-based config for Reverb. Key files:
- `config/reverb.php`: Reverb server configuration (port, scaling, rate limits)
- `config/broadcasting.php`: Broadcasting driver setup
- Environment variables control most Reverb settings (see `.env.example`)

---

## Project-Specific Conventions

### TypeScript/React Patterns

1. **Import Organization** (ESLint enforced)
   - Separated type imports: `import type { X } from 'pkg'` (separate from value imports)
   - Order: builtin → external → internal → parent → sibling → index
   - Example: Type imports come first, then other imports, all alphabetized

2. **Component Structure**
   - UI components live in `resources/js/components/ui/` (ignored by linter)
   - Generated shadcn/ui components auto-imported (configured in Wayfinder)
   - App components in `resources/js/components/` (not ui subfolder)
   - Pages in `resources/js/pages/` - auto-discovered by Inertia

3. **Inertia Response Pattern**
   - Controllers use `Inertia::render()` to render pages with data
   - Props passed as 2nd argument: `Inertia::render('page/name', ['data' => $value])`
   - Page components live at `resources/js/pages/{path}.tsx` matching route structure
   - No trailing slash in component names

### PHP/Laravel Patterns

1. **Service Provider Override Pattern** (AppServiceProvider.php)
   - Use `$this->app->instance()` in `boot()` to override framework defaults AFTER other providers' `register()` calls
   - Example: DatabaseLogger overrides Reverb's NullLogger

2. **Event Listener Conventions**
   - Register listeners in `AppServiceProvider::boot()` using `Event::listen()`
   - Use array form: `[ClassName::class, 'methodName']`
   - Always catch exceptions in event handlers that touch external systems (database, broadcasting)

3. **Model Attribute Aliases**
   - Use `Attribute::make()` to expose computed properties
   - Example: `ReverbApp::appId` as an alias for `id` for Reverb SDK readability

4. **Cascade Deletion**
   - Use model boot hook to clean up related records: `static::deleting()` callback
   - Example: ReverbApp deletion cascades to ReverbLog

### Database & Migrations

- SQLite default for local development (database.sqlite)
- Migrations auto-discovered from `database/migrations/`
- In-memory SQLite for tests (see phpunit.xml)

### Code Style

- **PHP**: Laravel Pint preset (PSR-12 with Laravel specifics)
- **JavaScript**: ESLint + Prettier + Tailwind class sorting
- **Type strictness**: `@typescript-eslint/no-explicit-any` is OFF (pragmatic for real projects)
- **Control statements**: Must have blank lines before/after (enforced by ESLint)

---

## Integration Points & External Dependencies

### Real-Time Communication

- **Laravel Echo (global)**: Configured with `configureEcho({ broadcaster: 'reverb' })` in `app.tsx` — `@laravel/echo-react` auto-fills `VITE_REVERB_*` env vars as defaults
- **Per-app Echo (debug console)**: `apps/show.tsx` creates a dedicated `new Echo({ key: app.key, ... })` instance for each selected app, using `authEndpoint: /apps/{id}/broadcasting/auth`
- **Custom channel auth**: `AppBroadcastAuthController` signs private-channel auth tokens with the selected app's secret (HMAC-SHA256), allowing the admin to subscribe to any channel on any app
- **Direct Pusher broadcasting**: `ReverbEventLogger` and `AppDebugController` use `new Pusher(app->key, app->secret, ...)` with `config('broadcasting.connections.reverb.options')` — never hardcode `127.0.0.1`

### Authentication & Authorization

- **Fortify**: Handles auth scaffolding (login, registration, 2FA)
- **Pulse Access Gate**: Currently grants all authenticated users access (`Gate::define('viewPulse', fn ($user) => true)`)

### Key Dependencies

| Package | Purpose | Versions |
|---------|---------|----------|
| `laravel/reverb` | WebSocket server framework | ^1.10 |
| `laravel/fortify` | Auth scaffolding | ^1.34 |
| `inertiajs/inertia-laravel` | SSR + page rendering | ^3.0 |
| `@inertiajs/react` + `@laravel/echo-react` | Frontend integration | ^3.0 |
| `laravel/pulse` | Performance monitoring | ^1.7 |

### Frontend Build Pipeline

- **Vite**: Primary bundler with React compiler plugin for auto-memoization
- **React Compiler**: Babel plugin that optimizes components without manual `memo()`
- **Tailwind CSS 4**: Via `@tailwindcss/vite` plugin
- **Wayfinder**: Auto-discovers shadcn/ui components and form variants

---

## Error Handling & Resilience

### Database Errors Don't Break WebSocket Server

```php
// Pattern from ReverbEventLogger - ALWAYS use this for server-side logging
try {
    ReverbLog::create([...]);
} catch (\Throwable) {
    // Never let logging errors crash Reverb
}
```

### Per-App Logging Flags

Respect the app configuration before logging:
```php
if ($app && ! $app->log_messages) {
    return; // Skip expensive JSON processing if disabled
}
```

### Type Checking Before Access

```php
// From DatabaseApplicationProvider::findById()
$app = ReverbApp::find((int) $id);
if (! $app) {
    throw new InvalidApplication; // Let Reverb handle the exception
}
```

---

## Testing

### Writing Tests

- **Location**: `tests/Feature/` for HTTP tests, `tests/Unit/` for unit tests
- **Framework**: Pest PHP with Laravel plugin
- **Test Database**: In-memory SQLite (configured in phpunit.xml)
- **Example**: Run `php artisan test` to execute all tests

### Key Gotchas

- Tests run in `APP_ENV=testing` mode
- Pulse and Telescope are disabled in tests (see phpunit.xml)
- Email sent asynchronously in tests (MAIL_MAILER=array)

---

## File Organization Quick Reference

```
app/
  Reverb/              # Reverb integration layer
    DatabaseApplicationProvider.php
    DatabaseLogger.php
  Listeners/           # Event subscribers
    ReverbEventLogger.php
  Http/Controllers/
    Apps/              # App management endpoints
      AppController.php
      AppDebugController.php         # Sends test events via per-app Pusher
      AppBroadcastAuthController.php # Signs channel auth with app's secret
      AppLogsController.php
    Settings/          # Settings pages
  Models/
    ReverbApp.php      # Main app config
    ReverbLog.php      # Event log
  Events/
    ReverbDebugEvent.php  # Kept for reference (not used for broadcasting)

resources/js/
  pages/               # Inertia page components (auto-discovered)
  components/          # Reusable components
    ui/                # shadcn/ui auto-imported
  layouts/             # App/Auth/Settings layouts
  hooks/               # Custom React hooks
  lib/                 # Utilities

routes/
  web.php              # Web routes (auth protected group + dashboard)
  channels.php         # Private channel auth (admin panel's own global Echo)
  settings.php         # Settings sub-routes

config/
  reverb.php           # Reverb server config (database app provider)
  inertia.php          # SSR settings + page discovery
  broadcasting.php     # Broadcaster selection + Reverb connection options
```

---

## Quick Start for New Features

### Adding a Dashboard Widget

1. Create React component in `resources/js/components/widgets/`
2. Update page in `resources/js/pages/dashboard.tsx`
3. If real-time updates needed:
   - Subscribe to Echo channel in useEffect
   - Listen for `debug.event` messages
   - Update local state

### Adding a New App Setting

1. Add column to `reverb_apps` table (create migration)
2. Update `ReverbApp` model's `$fillable` and `$casts`
3. Update `DatabaseApplicationProvider::toApplication()` to include in Application constructor
4. Update controller to return in Inertia response
5. Add UI field in settings form

### Adding a Monitoring Event

1. Add listener method in `ReverbEventLogger`
2. Register in `AppServiceProvider::registerReverbEventListeners()`
3. Call `$this->broadcastToApp($app, 'event.name', $payload)` — uses per-app Pusher with `config('broadcasting.connections.reverb.options')`
4. Frontend subscribes via the per-app Echo instance in `apps/show.tsx` using `.private('reverb-admin-debug.{app.id}').listen('.event.name', cb)`

---

## IDE & Tools Setup

- **PHP IDE Helpers**: Laravel IDE helper stubs in `vendor/_laravel_idea/`
- **TypeScript**: tsconfig.json configured with strict mode
- **Formatting**: Prettier configured to sort Tailwind classes automatically
- **Real-time Errors**: ESLint ignores generated files (ui/, actions/, routes/, wayfinder/)

# Wayfinder Routes Usage Guide

Do not touch folders wayfinder, routes and actions. It's autogenerated.

## Core Rule: `object.method(args).url`

Call the method with arguments first, then access `.url` property.

## Import pattern

Import parent objects, not individual URLs with aliases
```
import apps from '@/routes/apps';
```

Never Use Hardcoded URLs
