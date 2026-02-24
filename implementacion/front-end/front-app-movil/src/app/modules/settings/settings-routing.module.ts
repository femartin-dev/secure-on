import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigLayoutComponent } from './components/config-layout/config-layout.component';
import { ContactsConfigComponent } from './components/contacts-config/contacts-config.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigLayoutComponent,
    children: [
      { path: '', redirectTo: 'contacts', pathMatch: 'full' },
      { path: 'contacts', component: ContactsConfigComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
