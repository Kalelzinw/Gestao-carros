import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { cpfValidator, passwordValidator } from '../../validators';
import { CommonModule } from '@angular/common';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { provideNgxMask } from 'ngx-mask';
import { LoginService } from '../../services/login.service';

interface SignupForm {
  name: FormControl;
  email: FormControl;
  cpf: FormControl;
  tel: FormControl;
  nasc: FormControl;
  password: FormControl;
  passwordConfirm: FormControl;
  imagem: FormControl;
}

function telefoneValido(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valor = control.value;
    const regexTelefone = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (valor && !regexTelefone.test(valor)) {
      return { telefoneInvalido: { value: control.value } };
    }
    return null;
  };
}

function senhasIguaisValidator(campoSenha: string, campoConfirmacao: string): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const senha = formGroup.get(campoSenha)?.value;
    const confirmar = formGroup.get(campoConfirmacao)?.value;

    return senha === confirmar ? null : { senhasDiferentes: true };
  };
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
      imagem: new FormControl(null, [Validators.required]),
    }, {
      validators: senhasIguaisValidator('password', 'passwordConfirm')
    });
  }

  selecionarImagem(): void {
    this.imagemInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.type !== 'image/png') {
      this.toastService.error('Apenas arquivos PNG são permitidos.');
      this.signupForm.get('imagem')?.setErrors({ tipoInvalido: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemBase64 = reader.result as string;
      this.previewImagem = this.imagemBase64;
      this.signupForm.get('imagem')?.setValue(this.imagemBase64);
      this.signupForm.get('imagem')?.updateValueAndValidity();
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.signupForm.valid) {
      const cpfLimpo = this.signupForm.get('cpf')?.value.replace(/\D/g, '');

      this.loginService.signup(
        this.imagemBase64!,
        this.signupForm.value.name!,
        cpfLimpo,
        this.signupForm.value.tel!,
        this.signupForm.value.nasc!,
        this.signupForm.value.email!,
        this.signupForm.value.password!,
        this.signupForm.value.passwordConfirm!
      ).subscribe({
        next: () => {
          this.toastService.success("Cadastro feito com sucesso!");
          this.navigate();
        },
        error: (error) => {
          console.error("Erro ao registrar:", error);
          this.toastService.error("Erro ao registrar, tente novamente.");
          // Aqui você pode adicionar lógica para exibir mensagens de erro mais específicas
          // com base na resposta do backend (se o backend retornar alguma mensagem)
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