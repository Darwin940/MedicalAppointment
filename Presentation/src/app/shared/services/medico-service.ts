import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { MedicoCreateInput, MedicoModel } from '../models/medico-model';
import { environment } from '../../../environments/environment.development';

type ParametrosMedico = Record<string, string | number | boolean>;
const _SERVIDOR = environment.servidor;
interface RespuestaMedicos {
  data: MedicoModel[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface RespuestaMedico {
  data: MedicoModel | null;
}

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly parametros = signal<ParametrosMedico | null>(null);
  private readonly medicoId = signal<number | null>(null);
  private readonly http = inject(HttpClient);
  
  readonly medicos = httpResource<RespuestaMedicos>(() => {
    const parametros = this.parametros();
    if (parametros === null) {
      return undefined;
    }

    return {
      url: `${_SERVIDOR}/medicos/filter/0/5`,
      params: parametros,
    };
  });

  readonly medicoPorId = httpResource<RespuestaMedico>(() => {
    const id = this.medicoId();
    return id === null ? undefined : `${_SERVIDOR}/medicos/${id}`;
  });

  filtrar(parametros: ParametrosMedico): void {
    this.parametros.set(parametros);
  }

  buscarPorId(id: number): void {
    this.medicoId.set(id);
  }

  guardar(datos: MedicoCreateInput, id?: number) {
    if (id !== undefined) {
      return this.http.put<any>(`${_SERVIDOR}/medicos/${id}`, datos);
    } else {
      return this.http.post<any>(`${_SERVIDOR}/medicos`, datos);
    }
  }
}
