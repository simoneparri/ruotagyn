import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch((error: unknown) => {
  console.error('Avvio di RuotaGyn non riuscito.', error);
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'Impossibile avviare RuotaGyn. Ricarica la pagina per riprovare.';
  document.body.append(message);
});
