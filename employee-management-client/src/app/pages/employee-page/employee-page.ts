import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Department } from '../../models/department.model';
import { CreateEmployeeRequest, Employee } from '../../models/employee.model';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-page.html'
})
export class EmployeePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);

  protected readonly pageSize = 10;
  protected employees: Employee[] = [];
  protected departments: Department[] = [];
  protected searchTerm = '';
  protected pageNumber = 1;
  protected totalCount = 0;
  protected isLoadingEmployees = false;
  protected isLoadingDepartments = false;
  protected isSubmittingEmployee = false;
  protected showEmployeeForm = false;
  protected deletingEmployeeId: number | null = null;
  protected loadErrorMessage = '';
  protected formErrorMessage = '';

  protected readonly employeeForm = this.formBuilder.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    hireDate: ['', [Validators.required]],
    salary: [null as number | null, [Validators.required, Validators.min(0)]],
    department: [null as number | null, [Validators.required]],
    isActive: [true]
  });

  public ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  protected get hasPreviousPage(): boolean {
    return this.pageNumber > 1;
  }

  protected get hasNextPage(): boolean {
    return this.pageNumber < this.totalPages;
  }

  protected get resultsLabel(): string {
    if (this.totalCount === 0) {
      return 'No employees found';
    }

    const startRecord = (this.pageNumber - 1) * this.pageSize + 1;
    const endRecord = Math.min(this.pageNumber * this.pageSize, this.totalCount);

    return `Showing ${startRecord}-${endRecord} of ${this.totalCount} employees`;
  }

  protected toggleEmployeeForm(): void {
    this.showEmployeeForm = !this.showEmployeeForm;
    this.formErrorMessage = '';
  }

  protected updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  protected applySearch(): void {
    this.pageNumber = 1;
    this.loadEmployees();
  }

  protected clearSearch(): void {
    if (!this.searchTerm.trim()) {
      return;
    }

    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadEmployees();
  }

  protected goToPreviousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.pageNumber--;
    this.loadEmployees();
  }

  protected goToNextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.pageNumber++;
    this.loadEmployees();
  }

  protected submitEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmittingEmployee = true;
    this.formErrorMessage = '';

    const formValue = this.employeeForm.getRawValue();
    const employeeRequest: CreateEmployeeRequest = {
      fullName: formValue.fullName ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? '',
      hireDate: formValue.hireDate ?? '',
      salary: Number(formValue.salary),
      department: Number(formValue.department),
      isActive: Boolean(formValue.isActive)
    };

    this.employeeService.addEmployee(employeeRequest).subscribe({
      next: () => {
        this.isSubmittingEmployee = false;
        this.showEmployeeForm = false;
        this.pageNumber = 1;
        this.employeeForm.reset({
          fullName: '',
          email: '',
          phone: '',
          hireDate: '',
          salary: null,
          department: null,
          isActive: true
        });
        this.loadEmployees();
      },
      error: () => {
        this.isSubmittingEmployee = false;
        this.formErrorMessage = 'Unable to add the employee right now.';
      }
    });
  }

  protected deleteEmployee(employeeId: number): void {
    this.deletingEmployeeId = employeeId;
    this.loadErrorMessage = '';

    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        const deletedLastRowOnPage = this.employees.length === 1 && this.pageNumber > 1;

        if (deletedLastRowOnPage) {
          this.pageNumber--;
        }

        this.deletingEmployeeId = null;
        this.loadEmployees();
      },
      error: () => {
        this.deletingEmployeeId = null;
        this.loadErrorMessage = 'Unable to delete the employee right now.';
      }
    });
  }

  protected getDepartmentName(departmentValue: number): string {
    return this.departments.find((department) => department.value === departmentValue)?.name ?? 'Unknown';
  }

  protected hasError(controlName: keyof typeof this.employeeForm.controls): boolean {
    const control = this.employeeForm.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  protected getErrorMessage(controlName: keyof typeof this.employeeForm.controls): string {
    const control = this.employeeForm.controls[controlName];

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('min')) {
      return 'Value must be 0 or greater.';
    }

    return 'Invalid value.';
  }

  private loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.loadErrorMessage = '';

    this.employeeService.getEmployees(this.searchTerm, this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.employees = result.items;
        this.pageNumber = result.pageNumber;
        this.totalCount = result.totalCount;
        this.isLoadingEmployees = false;
      },
      error: () => {
        this.isLoadingEmployees = false;
        this.loadErrorMessage = 'Unable to load employees right now.';
      }
    });
  }

  private loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.formErrorMessage = '';

    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.isLoadingDepartments = false;
      },
      error: () => {
        this.isLoadingDepartments = false;
        this.formErrorMessage = 'Unable to load departments right now.';
      }
    });
  }
}
