import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MedicoService } from '../../shared/services/medico-service';
import { MedicoCreateInput, MedicoModel } from '../../shared/models/medico-model';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmMedico } from '../forms/frm-medico/frm-medico';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule],
  selector: 'app-medico-component',
  styleUrl: './medico-component.css',
  templateUrl: './medico-component.html',
})
export class MedicoComponent implements OnInit {
  buscarID = signal<number | null>(null);

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

  filtro : { nombre: string; cedula: string; especialidad: string } = 
    { nombre: '', cedula: '', especialidad: '' };

  constructor() {
    effect(() => {
      const respuesta = this.srvMedico.medicos.value();
      if (respuesta !== undefined) {
        this.dataSource.set(respuesta.data);
      }
    });

    effect(() => {
      const id = this.buscarID();
      const respuesta = this.srvMedico.medicoPorId;

      if (id === null) {
        return;
      }

      if (respuesta.status() === 'resolved') {
        const medico = respuesta.value()?.data;
        this.mostrarDialogo('Editar Médico', medico!, false, id);
      } else if (respuesta.status() === 'error') {
        console.error(`No se pudo buscar el médico con ID ${id}:`, respuesta.error());
        alert('No se pudo cargar el médico');
      }
    });
  }

  private resetFilter() : void {
    this.filtro = { nombre: '', cedula: '', especialidad: '' };
    this.filterMedicos();
  }

  private filterMedicos() {
    this.srvMedico.filtrar(this.filtro);
  }

  private alerta(icono: string, mensaje: string, textoAceptar: string) {
    this.dialog.open(DialogoGeneral, {
      width: '30vw',
      maxWidth: '20rem',
      data: {
        icono: icono,
        texto: mensaje,
        textoAceptar: textoAceptar
      }
    });
  }

  public mostrarDialogo(titulo: string, datos?: MedicoModel, info?: boolean, id?: number) {
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
    dialogRef.afterClosed().subscribe((objMedico) => {
      if (objMedico === undefined || objMedico === false) {
        return;
      }

      this.srvMedico.guardar(objMedico, id).subscribe({
        complete: () => {
          this.resetFilter();
          this.alerta('check', id === undefined ? 'Datos creados' : 'Datos actualizados', ' Cerrar ');
        },
        error: () => {
          this.alerta('error', 'No se pudo guardar el médico', ' Cerrar ');
        }
      });
    });
  }

  onCreate(): void {
    this.buscarID.set(null);
    this.mostrarDialogo('Nuevo Cliente');
  }

  onEdit(idMedico: number): void {
    this.buscarID.set(idMedico);
    this.srvMedico.buscarPorId(idMedico);
  }

  onDelete(idMedico: number): void {
    console.log("Eliminar medico ", idMedico);
  }

  onInfo(idMedico: number): void {
    console.log("Ver información de medico ", idMedico);
  }

  onResetPassword(idMedico: number): void {
    console.log("Resetear contraseña de ", idMedico);
  }

  onResetPassw(idMedico: number): void {
    this.onResetPassword(idMedico);
  }

  ngOnInit(): void {
    this.resetFilter();
  }
}
