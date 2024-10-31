import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent {
  @Input() startDate: string;
  @Input() endDate: string;
  minDate: string;

  constructor(private modalController: ModalController) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  close() {
    this.modalController.dismiss();
  }

  applyFilter() {
    if (this.startDate && this.endDate) {
      const filterData = {
        startDate: this.startDate,
        endDate: this.endDate,
      };
      this.modalController.dismiss(filterData); // Envía las fechas filtradas al componente padre
    } else {
      console.warn('Fechas no válidas:', this.startDate, this.endDate);
    }
  }

  clearFilters() {
    this.startDate = '';
    this.endDate = '';
    // Cierra el modal y devuelve valores nulos para indicar que se borraron los filtros
    this.modalController.dismiss({ startDate: null, endDate: null });
  }
}
