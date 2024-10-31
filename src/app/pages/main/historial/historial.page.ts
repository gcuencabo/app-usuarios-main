import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';
import { FilterModalComponent } from 'src/app/filter-modal/filter-modal.component';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  incidents: any[] = [];
  filteredIncidents: any[] = [];
  userEmail: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.getUserEmail();
    this.getIncidents();
  }

  getUserEmail() {
    const user = this.utilsService.getFromLocalStorage('user');
    if (user && user.email) {
      this.userEmail = user.email;
    } else {
      console.warn('No se encontró el correo del usuario en el localStorage');
    }
  }

  async getIncidents() {
    if (this.userEmail) {
      try {
        this.incidents = await this.firebaseService.getIncidentsByUserEmail(this.userEmail);
        this.filteredIncidents = [...this.incidents]; // Inicializa los incidentes filtrados
      } catch (error) {
        console.error('Error al obtener los incidentes:', error);
      }
    } else {
      console.warn('El correo electrónico del usuario no está disponible.');
    }
  }

  async openFilterModal() {
    const modal = await this.modalController.create({
      component: FilterModalComponent,
      componentProps: {
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        if (data.data.startDate === null && data.data.endDate === null) {
          // Si se borran los filtros, restablece todos los incidentes
          this.resetFilters();
        } else {
          this.startDate = data.data.startDate;
          this.endDate = data.data.endDate;
          this.applyDateFilter();
        }
      }
    });

    return await modal.present();
  }

  applyDateFilter() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();

      if (!isNaN(start) && !isNaN(end) && start <= end) {
        this.filteredIncidents = this.incidents.filter((incident) => {
          const incidentDate = new Date(incident.date).getTime();
          return incidentDate >= start && incidentDate <= end;
        });
      } else {
        console.error('Fechas no válidas');
      }
    }
  }

  resetFilters() {
    this.startDate = ''; // Limpia las fechas de inicio
    this.endDate = '';   // Limpia las fechas de finalización
    this.filteredIncidents = [...this.incidents]; // Muestra todos los incidentes
  }
}