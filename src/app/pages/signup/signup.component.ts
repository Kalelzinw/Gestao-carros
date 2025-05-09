import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { Form, FormControl, FormGroup, FormRecord, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common'; // Importe o CommonModule
import { cpfOnlyNumbersValidator } from '../../validators';

interface SignupForm {
  name: FormControl,
  email: FormControl,
  cpf: FormControl,
  tel: FormControl,
  nasc: FormControl;
  password: FormControl,
  passwordConfirm: FormControl
}
function cpfValido(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valor = control.value;
    if (valor && valor.length !== 11) {
      return { cpfInvalido: { value: control.value } };
    }
    return null;
  };
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



@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
    CommonModule
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignUpComponent {
  signupForm!: FormGroup<SignupForm>;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ){
    this.signupForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      cpf: new FormControl('', [Validators.required, cpfOnlyNumbersValidator()]),
      tel: new FormControl('', [Validators.required, telefoneValido()]),
      nasc: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }

  submit(){
    this.loginService.login(this.signupForm.value.email, this.signupForm.value.password).subscribe({
      next: () => this.toastService.success("Login feito com sucesso!"),
      error: () => this.toastService.error("Erro inesperado! Tente novamente mais tarde")
    })
  }

  navigate(){
    this.router.navigate(["login"])
  }
}