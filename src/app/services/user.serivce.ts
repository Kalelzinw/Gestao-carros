// src/app/services/user.serivce.ts (ou login.service.ts)

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loginResponse } from '../types/login-response.type';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SignupData } from '../interfaces/signup-data.interface'; 

interface UpdateUserProfileData {
  imagemBase64: string;
  email: string;
  password: string;
  passwordConfirm: string;
  tel: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService { 
  private apiUrl = "http://localhost:8080/auth";
  private userapiUrl = "http://localhost:8080/user";

  constructor(private httpClient: HttpClient) {}

  login(email: string, password: string): Observable<loginResponse> {
    return this.httpClient.post<loginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(value => {
        sessionStorage.setItem("auth-token", value.token);
        sessionStorage.setItem("username", value.name);
      })
    );
  }


  signup(data: SignupData): Observable<loginResponse> { 
    return this.httpClient.post<loginResponse>(`${this.apiUrl}/register`, data).pipe( 
      tap(value => {
        sessionStorage.setItem("auth-token", value.token);
        sessionStorage.setItem("username", value.name);
      })
    );
  }

  updateUserProfile(data: Partial<UpdateUserProfileData>): Observable<any> {
    return this.httpClient.patch<any>(`${this.userapiUrl}/update`, data).pipe(
    
    );
  }

  deleteUserProfile(): Observable<any> {
    return this.httpClient.delete<any>(`${this.userapiUrl}/delete`).pipe(
      tap(() => {
        console.log('✅ Conta deletada permanentemente com sucesso no backend.');
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("username");
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro desconhecido ao deletar a conta.';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro do lado do cliente: ${error.error.message}`;
        } else {
          console.error(`Status do erro: ${error.status}`);
          console.error(`Corpo do erro: ${JSON.stringify(error.error)}`);
          if (error.status === 401 || error.status === 403) {
            errorMessage = 'Você não tem permissão para realizar esta ação. Faça login novamente.';
          } else if (error.status === 404) {
            errorMessage = 'O endpoint para deletar a conta não foi encontrado.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor ao deletar a conta. Tente novamente mais tarde.';
          } else if (error.error && error.error.message) {
            errorMessage = `Erro do servidor: ${error.error.message}`;
          }
        }
        console.error(`🚨 Erro ao deletar conta: ${errorMessage}`);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getUserProfile(): Observable<any> {
    return this.httpClient.get<any>(`${this.userapiUrl}/profile`);
  }
}