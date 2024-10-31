import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-incidente',
  templateUrl: './incidente.page.html',
  styleUrls: ['./incidente.page.scss'],
})
export class IncidentePage implements OnInit {
  currentDate: Date;
  incidentType: string = '';
  incidentPlace: string = '';
  incidentFloor: string = '';
  incidentDescription: string = '';
  otraDescripcion: string = '';
  descriptionEnabled: boolean = false;
  otroLugar: string = '';
  incidentZone: string = '';
  floorOptions: string[] = [];
  descriptionOptions: string[] = [];
  incidents: any[] = [];
  mostrarTextarea: boolean = false;
  incidentDescriptionDetallada: string = '';
  photo: string | undefined;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.getCurrentDate();
  }

  getCurrentDate() {
    this.currentDate = new Date();
  }

  enableDescriptionAndPlace() {
    this.descriptionEnabled = !!this.incidentType;
    console.log('descriptionEnabled:', this.descriptionEnabled);
    this.updateDescriptionOptions(); 
  }

  updateFloorOptions() {
    this.floorOptions = [];

    switch (this.incidentPlace) {
      case 'Pabellón A':
        this.floorOptions = ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5', 'Piso 6', 'Piso 7', 'Piso 8'];
        break;
      case 'Pabellón B':
        this.floorOptions = ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5', 'Piso 6', 'Piso 7', 'Piso 8', 'Piso 9', 'Piso 10', 'Piso 11', 'Piso 12'];
        break;
      case 'Pabellón C':
      case 'Pabellón D':
      case 'Pabellón E':
      case 'Admisión':
      case 'Laboratorios de investigación':
      case 'Biblioteca':
      case 'Áreas administrativas':
      case 'Auditorio Mágnum':
      case 'Auditorio Los Caynas':
        this.floorOptions = ['Piso 1'];
        break;
      case 'Otro lugar':
        break;
      default:
        break;
    }
  }

  enableDescriptionAndPlace1() {
    this.updateDescriptionOptions();
  }

  updateDescriptionOptions() {
    this.descriptionOptions = [];
    this.mostrarTextarea = false;
    if (this.incidentType === 'Mantenimiento') {
      this.descriptionOptions = [
        'Derrame de líquidos',
        'Caño Roto',
        'Caídas de objetos',
        'Desbordamiento de baños',
        'Bloqueo de baños',
        'Limpieza de áreas comunes',
        'Desinfección de áreas',
        'Gestión de olores y malos olores',
        'Fuga de electricidad',
        'Ascensor atascado',
        'Otros'
      ];
    } else if (this.incidentType === 'Seguridad') {
      this.descriptionOptions = [
        'Violencia o altercados',
        'Robos o vandalismos',
        'Control de accesos',
        'Manejo de amenazas',
        'Inspecciones de seguridad',
        'Otros'
      ];
    }
  }

  onDescriptionChange() {
    this.mostrarTextarea = this.incidentDescription === 'Otros';
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.photo = image.dataUrl;
  }

  async addIncident() {
    if (this.incidentType && this.incidentDescription.trim() !== '' && this.incidentPlace && this.incidentFloor) {
      const user = this.utilsService.getFromLocalStorage('user');

      const criticidad = this.detectarCriticidad(this.incidentDescription);

      const incident = {
        type: this.incidentType,
        description: this.incidentDescription,
        place: this.incidentPlace,
        floor: this.incidentFloor,
        date: this.currentDate.toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        userEmail: user?.email || '',
        criticidad: criticidad,
        photo: this.photo
      };

      try {
        
      if (this.photo) {
        const photoUrl = await this.firebaseService.uploadPhotoToFirebase(this.photo);
        incident.photo = photoUrl;
      }

        await this.firebaseService.saveIncident(incident);
        this.utilsService.presentToast({ message: 'Incidente reportado con éxito', duration: 2000 });

        this.incidentType = '';
        this.incidentDescription = '';
        this.incidentPlace = '';
        this.incidentFloor = '';
        this.descriptionEnabled = false;
        this.photo = undefined;

        this.router.navigate(['perfiluser']);

      } catch (error) {
        console.error('Error al guardar el incidente en Firebase:', error);
      }
    } else {
      this.utilsService.presentToast({ message: 'Por favor, complete todos los campos.', duration: 2000 });
    }
  }

  

  detectarCriticidad(descripcion: string): string {
    const palabrasClaveBaja = ['limpieza', 'mantenimiento', 'gestión', 'desinfección'];
    const palabrasClaveMedia = ['robo', 'violencia', 'amenazas', 'desbordamiento', 'ascensor atascado'];
    const palabrasClaveAlta = ['fuga de electricidad', 'caño roto', 'bloqueo de baños'];

    descripcion = descripcion.toLowerCase();

    if (this.matchPalabrasClave(descripcion, palabrasClaveAlta)) {
      return 'Alta';
    } else if (this.matchPalabrasClave(descripcion, palabrasClaveMedia)) {
      return 'Media';
    } else {
      return 'Baja';
    }
  }

  matchPalabrasClave(texto: string, palabrasClave: string[]): boolean {
    for (let palabra of palabrasClave) {
      if (texto.includes(palabra)) {
        return true;
      }
    }
    return false;
  }
}
