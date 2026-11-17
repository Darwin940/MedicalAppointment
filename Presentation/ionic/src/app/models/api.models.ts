export interface TokenResponse {
  token: string;
  tkRef: string;
}

export interface TokenClaims {
  sub: string | number;
  username: string;
  rol_id: number;
  exp: number;
}

export interface AppUser {
  id: number;
  username: string;
  roleId: number;
}

export interface ApiList<T> {
  data: T[];
  pagination?: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface Doctor {
  id: number;
  nombre_completo: string;
  especialidad_id: number;
  especialidad_nombre?: string;
  licencia: string;
  telefono?: string | null;
}

export interface DoctorInput {
  nombre_completo: string;
  especialidad_id: number;
  licencia: string;
  telefono: string;
  username?: string;
  password?: string;
}

export interface Patient {
  id: number;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  telefono?: string | null;
}

export interface PatientInput {
  cedula?: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  telefono: string;
  username?: string;
  password?: string;
}
