import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.page.html',
  styleUrls: ['./editarperfil.page.scss'],
})
export class EditarPerfilPage implements OnInit {
  user: any = {};

  constructor(
    private router: Router,
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
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

  async saveChanges() {
    if (this.user.email) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      try {
        await this.firebaseSvc.updateUser(this.user);
        this.utilsSvc.presentToast({
          message: 'Usuario actualizado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
        
        this.router.navigate(['/main/salas']).then(() => {
          window.location.reload();
        });

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
}
