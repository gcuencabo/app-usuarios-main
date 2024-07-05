import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 
import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage, 

    children:[  
      {
        path: 'incidente',
        loadChildren: () => import('./incidente/incidente.module').then( m => m.IncidentePageModule)
      },
      {
        path: 'historial',
        loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule)
      },
      
    ]
    
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
