import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly httpClient = inject(HttpClient);
  private readonly departmentsEndpoint = `${environment.apiBaseUrl}/api/Departments`;

  public getDepartments(): Observable<Department[]> {
    return this.httpClient.get<Department[]>(this.departmentsEndpoint);
  }
}
