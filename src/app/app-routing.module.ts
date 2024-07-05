import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then( m => m.MainPageModule)
  },
  { path: 'editarperfil',
  loadChildren: () => import('./pages/main/editarperfil/editarperfil.module').then(m => m.EditarperfilPageModule) 
  },
  {
    path: 'incidente',
    loadChildren: () => import('./pages/main/incidente/incidente.module').then(m => m.IncidentePageModule)
  },
  {
    path: 'perfiluser',
    loadChildren: () => import('./pages/main/perfiluser/perfiluser.module').then(m => m.PerfiluserPageModule)
  },
  {
    path: 'main/historial',
    loadChildren: () => import('./pages/main/historial/historial.module').then(m => m.HistorialPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
