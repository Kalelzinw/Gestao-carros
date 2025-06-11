// src/app/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);

    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoggedIn to true and store token/userName on login', () => {
    const testToken = 'fake-jwt-token';
    const testUserName = 'Test User';
    const testAvatarUrl = 'http://example.com/avatar.jpg';

    service.login(testToken, testUserName, testAvatarUrl);

    // Verifica o estado interno do serviço
    expect(service.getCurrentUserName()).toBe(testUserName);
    expect(service.getCurrentUserAvatar()).toBe(testAvatarUrl);
    expect(service.getToken()).toBe(testToken);

    // Verifica o estado do BehaviorSubject
    service.isLoggedIn$.subscribe(loggedIn => {
      expect(loggedIn).toBeTrue();
    });

    // Verifica o localStorage
    expect(localStorage.getItem('token')).toBe(testToken);
    expect(localStorage.getItem('userName')).toBe(testUserName);
    expect(localStorage.getItem('userAvatarUrl')).toBe(testAvatarUrl);
  });

  it('should set isLoggedIn to false and clear storage on logout', () => {
    // Simula um estado logado antes do logout
    localStorage.setItem('token', 'some-token');
    localStorage.setItem('userName', 'Logged User');
    localStorage.setItem('userAvatarUrl', 'some-avatar.jpg');
    // Para que o serviço comece logado, podemos forçar o estado ou testar o logout após um login
    // Idealmente, o serviço seria reiniciado ou seu estado interno resetado.
    // Para este teste, vamos garantir que o BehaviorSubject reflete o estado inicial
    (service as any)._isLoggedIn.next(true); // Apenas para simular um estado inicial para este teste específico

    service.logout();

    expect(service.getCurrentUserName()).toBe('');
    expect(service.getCurrentUserAvatar()).toBe('/assets/img/default-avatar.png');
    expect(service.getToken()).toBeNull();

    service.isLoggedIn$.subscribe(loggedIn => {
      expect(loggedIn).toBeFalse();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
    expect(localStorage.getItem('userAvatarUrl')).toBeNull();
  });

  it('should restore login state from localStorage on service creation', () => {
    const testToken = 'persisted-token';
    const testUserName = 'Persisted User';
    const testAvatarUrl = 'http://example.com/persisted-avatar.jpg';

    // Simula que o token já está no localStorage antes do serviço ser criado
    localStorage.setItem('token', testToken);
    localStorage.setItem('userName', testUserName);
    localStorage.setItem('userAvatarUrl', testAvatarUrl);

    // Recria o serviço para simular a inicialização da aplicação
    service = TestBed.inject(AuthService);

    expect(service.getToken()).toBe(testToken);
    expect(service.getCurrentUserName()).toBe(testUserName);
    expect(service.getCurrentUserAvatar()).toBe(testAvatarUrl);

    service.isLoggedIn$.subscribe(loggedIn => {
      expect(loggedIn).toBeTrue();
    });
  });
});