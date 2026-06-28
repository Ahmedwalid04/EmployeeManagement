import { Routes } from '@angular/router';
import { EmployeePageComponent } from './pages/employee-page/employee-page';

export const routes: Routes = [
  {
    path: '',
    component: EmployeePageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
