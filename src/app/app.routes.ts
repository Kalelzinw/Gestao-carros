import { Routes } from '@angular/router';
import { LoginComponent } from './pages/user/login/login.component';
import { SignUpComponent } from './pages/user/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user-profile/user.component';

// --- IMPORTAÇÕES DOS COMPONENTES DE VEÍCULO ---
import { VehicleListComponent } from './pages/vehicle/vehicle-list/vehicle-list.component';
import { VehicleFormDetailComponent } from './pages/vehicle/vehicle-form-detail/vehicle-form-detail.component'; // Seu VehicleComponent renomeado

import { AuthGuard } from './services/auth-guard.service';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },

  {
    path: 'app',
    component: MainLayoutComponent,
    // AuthGuard REMOVIDO daqui para permitir acesso a outras rotas sem login durante o desenvolvimento.
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent }, // Home de volta
      { path: 'buscar', component: HomeComponent }, // Buscar de volta
      { path: 'user', component: UserComponent, canActivate: [AuthGuard] }, // AuthGuard APENAS aqui
      { path: 'vehicles', component: VehicleListComponent }, // Lista de veículos
      { path: 'vehicles/new', component: VehicleFormDetailComponent }, // Criar novo veículo
      { path: 'vehicles/edit/:id', component: VehicleFormDetailComponent }, // Editar/detalhes do veículo
    ]
  },

  // Rota para tratar caminhos não encontrados (404)
  { path: '**', redirectTo: 'app/home' }
];