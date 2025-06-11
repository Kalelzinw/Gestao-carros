import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { cpfValidator, passwordValidator, senhasIguaisValidator, telefoneValido } from '../../../validators';
import { CommonModule } from '@angular/common';
import { DefaultLoginLayoutComponent } from '../../../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../../../components/primary-input/primary-input.component';
import { provideNgxMask } from 'ngx-mask';
import { LoginService } from '../../../services/user.serivce';
import { SignupData } from '../../../interfaces/signup-data.interface'; // <-- IMPORTANTE: Importe a nova interface

interface SignupForm {
  name: FormControl<string | null>; // Melhor tipagem
  email: FormControl<string | null>;
  cpf: FormControl<string | null>;
  tel: FormControl<string | null>;
  nasc: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirm: FormControl<string | null>;
  imagem: FormControl<string | null>; // Imagem agora armazena o base64 diretamente
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
    CommonModule,
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent {
  signupForm: FormGroup<SignupForm>;
  imagemBase64: string | null = null;
  previewImagem: string | null = null;

  @ViewChild('imagemInput') imagemInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private loginService: LoginService
  ) {
    this.signupForm = new FormGroup<SignupForm>({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      cpf: new FormControl('', [Validators.required, cpfValidator()]),
      tel: new FormControl('', [Validators.required, telefoneValido()]),
      nasc: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, passwordValidator()]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imagem: new FormControl(null, [Validators.required]), // Imagem é obrigatória para o cadastro
    }, {
      validators: senhasIguaisValidator('password', 'passwordConfirm')
    });
  }

  selecionarImagem(): void {
    this.imagemInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      // Se nenhum arquivo foi selecionado ou a seleção foi cancelada, limpa os estados
      this.imagemBase64 = null;
      this.previewImagem = null;
      this.signupForm.get('imagem')?.setValue(null);
      this.signupForm.get('imagem')?.setErrors({ required: true }); // Se for obrigatória e não selecionada
      return;
    }

    const file = input.files[0];
    // Aceita PNG ou JPEG (se seu backend aceitar)
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      this.toastService.error('Apenas arquivos PNG ou JPEG são permitidos.');
      this.signupForm.get('imagem')?.setErrors({ tipoInvalido: true });
      this.imagemBase64 = null;
      this.previewImagem = null;
      this.signupForm.get('imagem')?.setValue(null); // Limpa o valor do FormControl
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemBase64 = reader.result as string;
      this.previewImagem = this.imagemBase64;
      // Define o valor do FormControl 'imagem' com o base64 para que a validação funcione
      this.signupForm.get('imagem')?.setValue(this.imagemBase64);
      this.signupForm.get('imagem')?.updateValueAndValidity(); // Força a revalidação
    };
    reader.readAsDataURL(file);
  }

  submit() {
    this.signupForm.markAllAsTouched(); // Marca todos os campos como tocados para exibir erros

    if (this.signupForm.valid) {
      const cpfLimpo = this.signupForm.get('cpf')?.value?.replace(/\D/g, '') || ''; // Garante que cpfLimpo seja string

      const signupPayload: SignupData = { // <-- CRIAÇÃO DO OBJETO DE PAYLOAD
        imagemBase64: this.imagemBase64!, // Usamos '!' pois Validators.required e onFileSelected garantem
        name: this.signupForm.value.name!,
        cpf: cpfLimpo,
        tel: this.signupForm.value.tel!,
        nasc: this.signupForm.value.nasc!,
        email: this.signupForm.value.email!,
        password: this.signupForm.value.password!,
        passwordConfirm: this.signupForm.value.passwordConfirm!
      };

      this.loginService.signup(signupPayload).subscribe({ // <-- PASSA O OBJETO COMPLETO
        next: () => {
          this.toastService.success("Cadastro feito com sucesso!");
          this.navigate();
        },
        error: (error) => {
          console.error("Erro ao registrar:", error);
          let errorMessage = "Erro ao registrar, tente novamente.";
          // Exemplo de como pegar mensagem de erro do backend se ele retornar um objeto { message: "..." }
          if (error.error && error.error.message) {
              errorMessage = error.error.message;
          } else if (error.message) {
              errorMessage = error.message;
          }
          this.toastService.error(errorMessage);
        }
      });
    } else {
      this.toastService.error("Por favor, preencha todos os campos corretamente.");
    }
  }

  navigate() {
    this.router.navigate(["login"]);
  }
}