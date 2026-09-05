import { Routes } from '@angular/router';
import { HelloWorld } from './features/hello-world/component/hello-world';

export const routes: Routes = [
  { path: '', redirectTo: 'helloworld', pathMatch: 'full' },
  { path: 'helloworld', component: HelloWorld }
];
