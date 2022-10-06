import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: "https://6ed9a0f1fe2540dd90bc91c6b709bfc5@o291529.ingest.sentry.io/4503938344484864",
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});
