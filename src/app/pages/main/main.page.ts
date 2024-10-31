import { Component, OnInit, enableProdMode, inject } from '@angular/core';
import { Title, platformBrowser } from '@angular/platform-browser';
import { Router, Event, NavigationEnd } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { environment } from 'src/environments/environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'src/app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

defineCustomElements(window);

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  user: any = {};
  pages = [{ title: 'Mi Historial', url: '/main/historial' }];

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  menuCtrl = inject(MenuController);
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
      }
    });
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
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  async updateUser() {
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
          icon: 'checkmark-circle-outline',
        });
      } catch (error: any) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 1500,
          color: 'secondary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  navigateToEditProfile() {
    this.router.navigate(['/editarperfil']);
  }

  navigateToperfiluser() {
    this.router.navigate(['/perfiluser']);
  }

  async signOut() {
    try {
      this.utilsSvc.removeItem('user');
      this.utilsSvc.routink('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      this.utilsSvc.presentToast({
        message: 'Error during sign out',
        duration: 2000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }

  isHistorialPage(): boolean {
    return this.currentPath === '/main/historial';
  }
}
