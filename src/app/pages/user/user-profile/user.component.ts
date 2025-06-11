import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { passwordValidator, telefoneValido } from '../../../validators';
import { provideNgxMask } from 'ngx-mask';
import { LoginService } from '../../../services/user.serivce';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DefaultLoginLayoutComponent } from '../../../components/default-login-layout/default-login-layout.component';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    FormInputComponent,
    CommonModule,
  ],
  providers: [
    provideNgxMask()
  ],
})
export class UserComponent implements OnInit {

  previewImagem: string | null = null;
  imagemBase64: string | null = null;

  userForm = new FormGroup({
    imagem: new FormControl<File | null>(null),
    tel: new FormControl('', telefoneValido()),
    email: new FormControl('', [Validators.email]),
    password: new FormControl(''),
    passwordConfirm: new FormControl(''),
  });

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginService.getUserProfile().subscribe((user: any) => {
      this.userForm.patchValue({
        email: user.email,
        tel: user.tel,
      });
      this.previewImagem = user.imagemBase64 || null;
      this.imagemBase64 = user.imagemBase64 || null;
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type !== 'image/png') {
        this.userForm.get('imagem')?.setErrors({ tipoInvalido: true });
        this.previewImagem = null;
        this.userForm.get('imagem')?.setValue(null);
        return;
      }

      this.userForm.get('imagem')?.setErrors(null);
      this.userForm.get('imagem')?.setValue(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImagem = reader.result as string;
        this.imagemBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.userForm.valid) {
      if (this.userForm.value.password !== this.userForm.value.passwordConfirm) {
        this.toastService.error('As senhas não coincidem.');
        return;
      }

      const dadosAtualizados: any = {};
      if (this.imagemBase64) dadosAtualizados.imagemBase64 = this.imagemBase64;
      if (this.userForm.value.email) dadosAtualizados.email = this.userForm.value.email;
      if (this.userForm.value.tel) dadosAtualizados.tel = this.userForm.value.tel;
      if (this.userForm.value.password) dadosAtualizados.password = this.userForm.value.password;

      console.log('Atualizando perfil com os dados:', dadosAtualizados);

      this.loginService.updateUserProfile(dadosAtualizados).subscribe({
        next: () => {
          this.toastService.success('Perfil atualizado com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao atualizar perfil:', error);
          this.toastService.error('Erro ao atualizar perfil, tente novamente.');
        },
      });
    } else {
      this.toastService.error('Formulário inválido.');
    }
  }

 
  onDeleteAccount() {
    console.log('1. Botão Deletar Conta clicado.');
    if (confirm('Tem certeza que deseja deletar sua conta permanentemente? Esta ação é irreversível e removerá todos os seus dados.')) {
      console.log('2. Confirmação de exclusão aceita.');
      this.loginService.deleteUserProfile().subscribe({
        next: () => {
          console.log('3. Requisição de exclusão bem-sucedida (next do subscribe).');
          this.toastService.success('Sua conta foi deletada com sucesso!');
          console.log('4. Tentando redirecionar para /login...');
          this.router.navigate(['/login']).then(success => {
            if (success) {
              console.log('5. Redirecionamento para /login bem-sucedido!');
            } else {
              console.warn('5. Redirecionamento para /login falhou (router.navigate retornou false).');
            }
          }).catch(navError => {
            console.error('5. Erro durante o redirecionamento:', navError);
          });
        },
        error: (err) => {
          console.error('3. Erro na requisição de exclusão (error do subscribe):', err);
          this.toastService.error(err.message || 'Erro ao deletar a conta. Tente novamente.');
        }
      });
    } else {
      console.log('2. Confirmação de exclusão negada.');
    }
  }
}
