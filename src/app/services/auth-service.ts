// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  private _currentUser = new BehaviorSubject<string>(''); // Para armazenar o nome do usuário
  private _currentUserAvatar = new BehaviorSubject<string>('/assets/img/default-avatar.png'); // Para o avatar

  constructor() {
    // Ao iniciar o serviço, verifica se já existe um token ou dados no localStorage
    // Isso é útil para manter o usuário logado após um refresh da página
    if (localStorage.getItem('token')) {
      this._isLoggedIn.next(true);
      this._currentUser.next(localStorage.getItem('userName') || '');
      this._currentUserAvatar.next(localStorage.getItem('userAvatarUrl') || '/assets/img/default-avatar.png');
    }
  }

  // Método para "logar" o usuário no frontend
  // Recebe o token e informações do usuário do backend
  login(token: string, userName: string, userAvatarUrl?: string) {
    // Armazena o token e outras informações no localStorage (ou sessionStorage, se preferir)
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
    if (userAvatarUrl) {
      localStorage.setItem('userAvatarUrl', userAvatarUrl);
      this._currentUserAvatar.next(userAvatarUrl);
    } else {
      localStorage.removeItem('userAvatarUrl'); // Garante que não há um avatar antigo
      this._currentUserAvatar.next('/assets/img/default-avatar.png'); // Define um avatar padrão
    }
    this._isLoggedIn.next(true); // Atualiza o BehaviorSubject para notificar os "ouvintes"
    this._currentUser.next(userName);
  }

  // Método para "deslogar" o usuário no frontend
  logout() {
    // Remove o token e outras informações do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatarUrl');
    this._isLoggedIn.next(false); // Atualiza o BehaviorSubject para indicar que não está logado
    this._currentUser.next('');
    this._currentUserAvatar.next('/assets/img/default-avatar.png');
  }

  // Métodos para obter informações do usuário logado
  getCurrentUserName(): string {
    return this._currentUser.value;
  }

  getCurrentUserAvatar(): string {
    return this._currentUserAvatar.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}