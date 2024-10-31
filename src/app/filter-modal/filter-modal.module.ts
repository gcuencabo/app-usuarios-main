import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FilterModalComponent } from './filter-modal.component';

@NgModule({
  declarations: [FilterModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [FilterModalComponent], // Asegúrate de exportar el componente
})
export class FilterModalModule {}
