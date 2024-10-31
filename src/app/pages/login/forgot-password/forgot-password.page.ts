import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  firesabeSvc = inject(FirebaseService);
  UtilsScv = inject(UtilsService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loadingIndicator = await this.UtilsScv.loading();
      await loadingIndicator.present();

      try {
        await this.firesabeSvc.sendRecoveryEmail(this.form.value.email);

        this.UtilsScv.presentToast({
          message: 'Correo de recuperación enviado exitosamente.',
          duration: 1500,
          color: 'tertiary',
          position: 'middle',
          icon: 'mail-outline',
        });

        // Redirige al usuario de vuelta a la página de inicio de sesión después de enviar el correo
        this.UtilsScv.routink('/login');
        this.form.reset();
      } catch (error: any) {
        console.error('Error al enviar correo de recuperación:', error);

        this.UtilsScv.presentToast({
          message: 'No se pudo enviar el correo. Por favor, intenta de nuevo.',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loadingIndicator.dismiss();
      }
    }
  }
}
