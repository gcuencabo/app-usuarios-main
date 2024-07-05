import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  incidents: any[] = [];
  userEmail: string;

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.getUserEmail();
    this.getIncidents();
  }

  getUserEmail() {
    const user = this.utilsService.getFromLocalStorage('user');
    this.userEmail = user?.email || '';
  }

  async getIncidents() {
    if (this.userEmail) {
      try {
        this.incidents = await this.firebaseService.getIncidentsByUserEmail(this.userEmail);
      } catch (error) {
        console.error('Error al obtener los incidentes:', error);
      }
    }
  }
}
