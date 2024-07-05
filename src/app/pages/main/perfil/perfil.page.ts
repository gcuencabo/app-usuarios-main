import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {  User } from 'src/app/models/user.model';
import {  FirebaseService  } from 'src/app/services/firebase.service';
import {  UtilsService  } from 'src/app/services/utils.service';



@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})

export class PerfilPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  reservations: any[] = [];
  minimized: boolean[] = [];

  async ngOnInit() {
  await this.loadReservations();

  this.getCurrentDate();
  this.checkReservations();
  setInterval(() => {
    this.getCurrentDate();
  }, 86400000); // Actualizar cada día (86400000 milisegundos = 1 día)
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  async loadReservations() {
    this.reservations = await this.firebaseSvc.getAllReservations();
    this.minimized = this.reservations.map(() => false);
  }

  deleteReservation(index: number) {
    this.reservations.splice(index, 1);
    this.minimized.splice(index, 1);
    // Aquí podrías llamar a un servicio para eliminar la reserva en el backend
    // this.firebaseSvc.deleteReservation(reservation.id);
  }

    toggleSize(index: number) {
    this.minimized[index] = !this.minimized[index];
  }

  
/*-------------------*/
currentDate: Date;
selectedSlot: number | null = null;
studentName: string = '';
students: string[] = [];
selectedSala: string = '';
salas: string[] = [];
isDisabled: boolean = false;
timeSlots: string[] = [
  '9:00 A 10:00', 
  '10:00 A 11:00', 
  '11:00 A 12:00', 
  '12:00 A 13:00', 
  '13:00 A 14:00', 
  '14:00 A 15:00', 
  '15:00 A 16:00', 
  '16:00 A 17:00', 
  '17:00 A 18:00'
];

disabledSlots: boolean[] = Array(this.timeSlots.length).fill(false);

constructor(
  private router: Router,
  private firebaseService: FirebaseService,
  private utilsService: UtilsService
) { const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { sala: string };
  if (state && state.sala) {
    this.selectedSala = state.sala;
  } else {
    // Si no se recibe la sala, redirigir al usuario a la página de selección de sala
    this.router.navigate(['/app/page/main/salas']);
  }}



getCurrentDate() {
  this.currentDate = new Date();
}

getDayNameSpanish(): string {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dayNames[this.currentDate.getDay()];
}



async checkReservations() {
  const date = this.currentDate.toISOString().split('T')[0]; // Obtener solo la fecha en formato yyyy-MM-dd
  for (let i = 0; i < this.timeSlots.length; i++) {
    const reservations = await this.firebaseService.getReservationsByRoomAndTimeSlot(this.selectedSala, date, this.timeSlots[i]);
    const isDisabled$ = this.firebaseService.isTimeSlotDisabled(this.selectedSala, date, this.timeSlots[i]);
    isDisabled$.subscribe(isDisabled => {
      if (reservations.length > 0 || isDisabled) {
        this.disabledSlots[i] = true;
      }
    });
  }
}

toggleTimeSlot(index: number) {
  if (this.selectedSlot === index) {
    this.selectedSlot = null;
    this.isDisabled = false;
  } else {
    this.selectedSlot = index;
    this.isDisabled = true;
  }
}

addStudent() {
  if (this.studentName.trim() !== '' && this.students.length < 6) {
    this.students.push(this.studentName);
    this.studentName = '';
  }
}

removeStudent(index: number) {
  this.students.splice(index, 1);
}

async navigateToReserva() {
  if (this.selectedSlot !== null && this.students.length > 0) {
    const reservation = {
      sala: this.selectedSala,
      date: this.currentDate.toISOString().split('T')[0], // yyyy-MM-dd
      horario: this.timeSlots[this.selectedSlot],
      students: this.students,
      timestamp: new Date().toISOString(),
      duration: 60000 // Duración de 1 minuto en milisegundos
    };

    try {
      await this.firebaseService.saveReservation(reservation);
      this.utilsService.presentToast({ message: 'Reserva realizada con éxito', duration: 2000 });

      // Deshabilitar el horario seleccionado
      this.disabledSlots[this.selectedSlot] = true;

      // Guardar el estado deshabilitado en Firebase
      await this.firebaseService.disableTimeSlot(this.selectedSala, this.currentDate.toISOString().split('T')[0], this.timeSlots[this.selectedSlot]);

      console.log('Reserva guardada exitosamente en Firebase');

      // Navegar a la nueva página después de guardar la reserva
      this.router.navigate(['/reserva'], {
        state: { data: reservation }
      });
    } catch (error) {
      console.error('Error al guardar la reserva en Firebase:', error);
      // Aquí puedes manejar el error, por ejemplo, mostrar una notificación al usuario
    }
  } else {
    // Mostrar una notificación o alerta de que se deben completar todos los campos
    this.utilsService.presentToast({ message: 'Por favor, selecciona una franja horaria y añade al menos un estudiante.', duration: 2000 });
  }
}









}
