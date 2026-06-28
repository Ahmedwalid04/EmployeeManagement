import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateEmployeeRequest, Employee } from '../models/employee.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly httpClient = inject(HttpClient);
  private readonly employeesEndpoint = `${environment.apiBaseUrl}/api/Employees`;

  public getEmployees(
    searchTerm: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PagedResult<Employee>> {
    const term = searchTerm?.trim() ?? '';
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (term.length > 0) {
      params = params.set('searchTerm', term);
    }

    return this.httpClient.get<PagedResult<Employee>>(this.employeesEndpoint, { params });
  }

  public addEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    return this.httpClient.post<Employee>(this.employeesEndpoint, employee);
  }

  public deleteEmployee(employeeId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.employeesEndpoint}/${employeeId}`);
  }
}
