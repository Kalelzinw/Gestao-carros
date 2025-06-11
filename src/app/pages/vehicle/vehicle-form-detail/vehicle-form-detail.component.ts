

import { Component, OnInit } from '@angular/core';
import { FormInputComponent } from "../../../components/form-input/form-input.component";
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DefaultLoginLayoutComponent } from '../../../components/default-login-layout/default-login-layout.component';
import { provideNgxMask } from 'ngx-mask';

import { telefoneValido } from '../../../validators'; 

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router'; 

import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../interfaces/vehicle.interface';


interface VehicleForm {
  imagem: FormControl<File | null>;
  marca: FormControl<string | null>;
  placa: FormControl<string | null>;
  chassi: FormControl<string | null>;
  ano: FormControl<string | null>;
  cor: FormControl<string | null>;
  modelo: FormControl<string | null>;
  quilometragem: FormControl<number | null>;
  local: FormControl<string | null>;
  valor: FormControl<number | null>;
  documento: FormControl<string | null>;
}

@Component({
  selector: 'app-vehicle-form-detail', 
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
  templateUrl: './vehicle-form-detail.component.html', 
  styleUrl: './vehicle-form-detail.component.scss' 
})
export class VehicleFormDetailComponent implements OnInit { 
  previewImagem: string | null = null;
  imagemBase64: string | null = null;
  vehicleId: string | null = null;
  isEditMode: boolean = false;

  vehicleForm = new FormGroup<VehicleForm>({
    imagem: new FormControl<File | null>(null),
    marca: new FormControl('', [Validators.required, Validators.minLength(2)]),
    placa: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z]{3}\d[A-Z0-9]\d{2}$|^[A-Z]{3}\d{4}$/)]),
    chassi: new FormControl('', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]),
    ano: new FormControl('', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]),
    cor: new FormControl('', [Validators.required, Validators.minLength(3)]),
    modelo: new FormControl('', [Validators.required, Validators.minLength(2)]),
    quilometragem: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    local: new FormControl('', [Validators.required, Validators.minLength(3)]),
    valor: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    documento: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  constructor(
    private vehicleService: VehicleService,
    private toastService: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.vehicleId = params.get('id');
      this.isEditMode = !!this.vehicleId;

      if (this.isEditMode) {
        this.loadVehicleDetails(this.vehicleId!);
      }
    });
  }

  loadVehicleDetails(id: string): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle: Vehicle) => {
        this.vehicleForm.patchValue({
          marca: vehicle.marca,
          placa: vehicle.placa,
          chassi: vehicle.chassi,
          ano: vehicle.ano,
          cor: vehicle.cor,
          modelo: vehicle.modelo,
          quilometragem: vehicle.quilometragem,
          local: vehicle.local,
          valor: vehicle.valor,
          documento: vehicle.documento,
        });
        if (vehicle.imagemBase64) {
          this.previewImagem = vehicle.imagemBase64;
          this.imagemBase64 = vehicle.imagemBase64;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do veículo:', err);
        this.toastService.error('Erro ao carregar detalhes do veículo.');
        this.router.navigate(['/app/vehicles']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.previewImagem = null;
      this.imagemBase64 = null;
      this.vehicleForm.get('imagem')?.setValue(null);
      this.vehicleForm.get('imagem')?.setErrors({ required: true });
      return;
    }

    const file = input.files[0];
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      this.toastService.error('Apenas imagens PNG ou JPEG são permitidas.');
      this.vehicleForm.get('imagem')?.setErrors({ tipoInvalido: true });
      this.previewImagem = null;
      this.imagemBase64 = null;
      this.vehicleForm.get('imagem')?.setValue(null);
      return;
    }

    this.vehicleForm.get('imagem')?.setErrors(null);
    this.vehicleForm.get('imagem')?.setValue(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImagem = reader.result as string;
      this.imagemBase64 = reader.result as string;
      this.vehicleForm.get('imagem')?.updateValueAndValidity();
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.vehicleForm.markAllAsTouched();

    if (this.vehicleForm.valid) {
      const vehicleData: Vehicle = {
        marca: this.vehicleForm.value.marca!,
        placa: this.vehicleForm.value.placa!,
        chassi: this.vehicleForm.value.chassi!,
        ano: this.vehicleForm.value.ano!,
        cor: this.vehicleForm.value.cor!,
        modelo: this.vehicleForm.value.modelo!,
        quilometragem: this.vehicleForm.value.quilometragem!,
        local: this.vehicleForm.value.local!,
        valor: this.vehicleForm.value.valor!,
        documento: this.vehicleForm.value.documento!,
        imagemBase64: this.imagemBase64!
      };

      if (this.isEditMode && this.vehicleId) {
        this.vehicleService.updateVehicle(this.vehicleId, vehicleData).subscribe({
            next: (responseVehicle: Vehicle) => {
                this.toastService.success('Veículo atualizado com sucesso!');
                console.log('Veículo atualizado:', responseVehicle);
                this.router.navigate(['/app/vehicles']);
            },
            error: (error: any) => {
                console.error('Erro ao atualizar veículo:', error);
                let errorMessage = 'Erro ao atualizar veículo. Verifique os dados e tente novamente.';
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                this.toastService.error(errorMessage);
            }
        });
      } else {
        this.vehicleService.createVehicle(vehicleData).subscribe({
          next: (responseVehicle: Vehicle) => {
            this.toastService.success('Veículo cadastrado com sucesso!');
            console.log('Veículo cadastrado:', responseVehicle);
            this.router.navigate(['/app/vehicles']);
          },
          error: (error: any) => {
            console.error('Erro ao cadastrar veículo:', error);
            let errorMessage = 'Erro ao cadastrar veículo. Verifique os dados e tente novamente.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.toastService.error(errorMessage);
          }
        });
      }

    } else {
      this.toastService.error('Por favor, preencha todos os campos obrigatórios corretamente.');
    }
  }


  onDeleteVehicle() {
    console.log('1. Botão Deletar Veículo clicado.');
   
    if (!this.isEditMode || !this.vehicleId) {
      this.toastService.error('Não foi possível determinar qual veículo deletar. Recarregue a página.');
      console.error('Erro: Tentativa de deletar veículo sem ID ou fora do modo de edição.');
      return;
    }

    if (confirm(`Tem certeza que deseja deletar este veículo (ID: ${this.vehicleId}) permanentemente? Esta ação é irreversível e removerá todos os seus dados.`)) {
      console.log('2. Confirmação de exclusão aceita.');
      
      this.vehicleService.deleteVehicle(this.vehicleId).subscribe({ 
        next: () => {
          console.log('3. Requisição de exclusão bem-sucedida (next do subscribe).');
          this.toastService.success('Veículo deletado com sucesso!');
          console.log('4. Tentando redirecionar para /app/vehicles...');
          this.router.navigate(['/app/vehicles']).then(success => {
            if (success) {
              console.log('5. Redirecionamento para /app/vehicles bem-sucedido!');
            } else {
              console.warn('5. Redirecionamento para /app/vehicles falhou (router.navigate retornou false).');
            }
          }).catch(navError => {
            console.error('5. Erro durante o redirecionamento:', navError);
          });
        },
        error: (err) => {
          console.error('3. Erro na requisição de exclusão (error do subscribe):', err);
          let errorMessage = 'Erro ao deletar o veículo. Tente novamente.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          this.toastService.error(errorMessage);
        }
      });
    } else {
      console.log('2. Confirmação de exclusão negada.');
    }
  }

}