// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http'; // Importe withInterceptorsFromDi e withFetch
import { provideAnimations } from '@angular/platform-browser/animations'; // Se estiver usando animações
import { provideToastr } from 'ngx-toastr'; // Se estiver usando ngx-toastr

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor'; // Importe seu interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    // Importante: use withInterceptorsFromDi para permitir o uso de HTTP_INTERCEPTORS
    provideHttpClient(withInterceptorsFromDi(), withFetch()), // Adicione withFetch() para usar o fetch API subjacente se preferir
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Permite múltiplos interceptors
    }
  ]
};