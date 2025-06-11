// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = sessionStorage.getItem('auth-token'); // Pega o token do sessionStorage

    if (token) {
      // Clona a requisição e adiciona o cabeçalho Authorization
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Token JWT adicionado ao cabeçalho da requisição:', request.url);
    } else {
      console.warn('Nenhum token JWT encontrado no sessionStorage para a requisição:', request.url);
    }

    return next.handle(request);
  }
}