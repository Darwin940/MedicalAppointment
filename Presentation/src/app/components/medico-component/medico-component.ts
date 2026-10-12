import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MedicoService } from '../../shared/services/medico-service';
import { MedicoModel } from '../../shared/models/medico-model';
import { FrmMedico } from '../forms/frm-medico/frm-medico';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule],
  selector: 'app-medico-component',
  styleUrl: './medico-component.css',
  templateUrl: './medico-component.html',
})
export class MedicoComponent implements OnInit {
  filtro: { nombre: string; cedula: string; especialidad: string } = { nombre: '', cedula: '', especialidad: '' };
  displayedColumns: string[] = [
    'id',
    'nombre_completo',
    'especialidad_nombre',
    'licencia',
    'telefono',
    'botonera'
  ];

  dataSource = signal<MedicoModel[]>([]);

  srvMedico = inject(MedicoService);
  dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      const respuesta = this.srvMedico.medicos.value();
      if (respuesta !== undefined) {
        this.dataSource.set(respuesta.data);
      }
    });
  }

  private resetearFiltro() {
    this.filtro = { nombre: '', cedula: '', especialidad: '' };
    this.filtrarMedicos();
  }

  private filtrarMedicos() {
    this.srvMedico.filtrar(this.filtro);
  }

  public mostrarDialogo(titulo: string, datos?: MedicoModel, info?: boolean) {
    const dialogRef = this.dialog.open(FrmMedico, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: titulo,
        data: datos,
        info: info
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe({
      complete: () => {
        console.log('Dialogo cerrado');
      }
    });
  }

  onCreate() {
    this.mostrarDialogo('Nuevo Cliente');
  }

  onEdit(medico: number) {
    console.log('Editar cliente:', medico);
  }

  onInfo(medico: number) {
    console.log('Ver cliente:', medico);
  }

  onDelete(medico: number) {
    console.log('Eliminar cliente:', medico);
  }

  onResetPassw(medico: number) {
    console.log('Restablecer contraseña del cliente:', medico);
  }

  ngOnInit(): void {
    this.resetearFiltro();
  }
}
