import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SignupService } from './signup.service';

describe('SignupService', () => {
  let service: SignupService;
  let httpMock: HttpTestingController;

    beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // 👈 aqui também
      providers: [SignupService]
    });
    service = TestBed.inject(SignupService);
     httpMock = TestBed.inject(HttpTestingController); // ✅ atribuição correta após TestBed
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não há requisições pendentes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request with user data to the register endpoint', () => {
    const dummyUserData = {
      name: 'Wendell',
      email: 'wendell@example.com',
      password: 'senhaSegura123'
    };

    // Chamada ao método register()
    service.register(dummyUserData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    // Espera a requisição POST
    const req = httpMock.expectOne(`${service['apiUrl']}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyUserData);

    // Resposta simulada
    req.flush({ success: true });
  });
});
