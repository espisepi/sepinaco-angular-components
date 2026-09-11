import { Routes } from '@angular/router';
import { HelloWorld } from './features/hello-world/component/hello-world';

export const routes: Routes = [
  { path: '', redirectTo: 'routed', pathMatch: 'full' },
  { path: 'helloworld', component: HelloWorld },
  {
    path: 'routed',
    loadComponent: () => import('./features/angular-three/routed/routed'),
    loadChildren: () => import('./features/angular-three/routed/routed.routes'),
    title: 'Routed - Angular Three Demo',
  },
];
