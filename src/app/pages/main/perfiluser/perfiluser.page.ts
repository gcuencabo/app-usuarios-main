import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Importa Router
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfiluser',
  templateUrl: './perfiluser.page.html',
  styleUrls: ['./perfiluser.page.scss'],
})
export class PerfilUserPage implements OnInit {
  user: any = {};
  

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private router: Router  // Añade Router al constructor
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    const email = this.utilsSvc.getFromLocalStorage('user')?.email;

    if (email) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const user = await this.firebaseSvc.getUserByEmail(email);
        if (user) {
          this.user = user;
        } else {
          throw new Error('Usuario no encontrado');
        }
        
      } catch (error: any) {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 1500,
          color: 'secondary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  // Método para navegar de regreso
  navigateToperfiluser() {
    this.router.navigate(['./main/incidente']);
  }
}
