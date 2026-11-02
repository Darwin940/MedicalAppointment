import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { MedicoModel } from '../models/medico-model';
import { environment } from '../../../environments/environment.development';

type ParametrosMedico = Record<string, string | number | boolean>;
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

const _SERVIDOR = environment.servidor;

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly parametros = signal<ParametrosMedico | null>(null);
  private readonly medicoId = signal<number | null>(null);

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

  public buscarPorId(id: number): void {
    this.medicoId.set(id);
  }

  public filtrar(parametros: ParametrosMedico): void {
    this.parametros.set(parametros);
  }

  public guardar(datos: any, id?: number) {
    if (datos && datos.id !== undefined) {
      delete datos.id;
    }

    if (id !== undefined) {
      return this.http.put<any>(`${_SERVIDOR}/medicos/${id}`, datos);
    } else {
      return this.http.post<any>(`${_SERVIDOR}/medicos`, datos);
    }
  }
}
