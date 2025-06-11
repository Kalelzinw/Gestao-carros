
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 


import { DefaultLoginLayoutComponent } from '../../../components/default-login-layout/default-login-layout.component';

import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../interfaces/vehicle.interface';
import { FormInputComponent } from "../../../components/form-input/form-input.component";

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent 
    ,
    FormInputComponent
],
  templateUrl: './vehicle-list.component.html', 
  styleUrl: './vehicle-list.component.scss' 
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];

  constructor(private vehicleService: VehicleService, private router: Router) { }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (err) => console.error('Erro ao carregar veículos:', err)
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/vehicles/new']); 
  }

  navigateToDetail(vehicleId: string | undefined): void {
    if (vehicleId) {
      this.router.navigate(['/app/vehicles/edit', vehicleId]); 
    }
  }
}