import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiList, Doctor, DoctorInput, Patient, PatientInput, TokenResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  login(credentials: { username: string; password: string }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  filterDoctors(filters: { nombre?: string; especialidad?: string; licencia?: string } = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value?.trim()) {
        params = params.set(key, value.trim());
      }
    }

    return this.http.get<ApiList<Doctor>>(`${this.baseUrl}/medicos/filter/0/100`, { params });
  }

  createDoctor(data: DoctorInput) {
    return this.http.post<{ data: Doctor }>(`${this.baseUrl}/medicos`, data);
  }

  updateDoctor(id: number, data: Partial<DoctorInput>) {
    return this.http.put<{ data: Doctor }>(`${this.baseUrl}/medicos/${id}`, data);
  }

  deleteDoctor(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/medicos/${id}`);
  }

  filterPatients(filters: { nombre?: string; cedula?: string } = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value?.trim()) {
        params = params.set(key, value.trim());
      }
    }

    return this.http.get<ApiList<Patient>>(`${this.baseUrl}/pacientes/filter/0/100`, { params });
  }

  createPatient(data: PatientInput) {
    return this.http.post<{ data: Patient }>(`${this.baseUrl}/pacientes`, data);
  }

  updatePatient(id: number, data: Partial<PatientInput>) {
    return this.http.put<{ data: Patient }>(`${this.baseUrl}/pacientes/${id}`, data);
  }

  deletePatient(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/pacientes/${id}`);
  }

  logout(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/auth/loggout/${id}`);
  }

  refreshSession(id: number, tkRef: string) {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/refresh-session/${id}`, { tkRef });
  }
}
