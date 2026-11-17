import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { autoTable, CellInput } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  print(columnHeaders: string[], rows: CellInput[][], title: string, save = false): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'letter'
    });
    doc.text(title, doc.internal.pageSize.width / 2, 25, { align: 'center' });
    autoTable(doc, {
      head: [columnHeaders],
      body: rows
    });
    if (save) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      doc.save(`reporte-${timestamp}.pdf`);
    } else {
      doc.output('dataurlnewwindow');
    }
  }
}
