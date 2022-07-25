import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export declare let require: any;
const { version: appVersion } = require('../package.json');

Sentry.init({
  dsn: 'https://094234f9e1024595801515548fd3d9cc@o1319586.ingest.sentry.io/6575225',
  integrations: [
    new BrowserTracing({
      tracingOrigins: ['http://myvineyards.tk/'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  release: 'winery@' + appVersion,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  enabled: environment.production === 'true',
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
