import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MedicoModel } from '../models/medico-model';

type ParametrosMedico = Record<string, string | number | boolean>;

interface RespuestaMedicos {
  data: MedicoModel[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly parametros = signal<ParametrosMedico | null>(null);

  readonly medicos = httpResource<RespuestaMedicos>(() => {
    const parametros = this.parametros();
    if (parametros === null) {
      return undefined;
    }

    return {
      url: 'http://localhost:9090/api/medicos/filter/0/5',
      params: parametros,
    };
  });

  filtrar(parametros: ParametrosMedico): void {
    this.parametros.set(parametros);
  }
}
