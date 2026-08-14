import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigLayoutComponent } from './components/config-layout/config-layout.component';
import { ContactsConfigComponent } from './components/contacts-config/contacts-config.component';
import { GeneralConfigComponent } from './components/general-config/general-config.component';
import { ActivationConfigComponent } from './components/activation-config/activation-config.component';
import { SecurityConfigComponent } from './components/security-config/security-config.component';
import { PerformanceConfigComponent } from './components/performance-config/performance-config.component';
import { NotificationsConfigComponent } from './components/notifications-config/notifications-config.component';
import { PermissionsConfigComponent } from './components/permissions-config/permissions-config.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigLayoutComponent,
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', component: GeneralConfigComponent },
      { path: 'activation', component: ActivationConfigComponent },
      { path: 'security', component: SecurityConfigComponent },
      { path: 'permissions', component: PermissionsConfigComponent },
      { path: 'performance', component: PerformanceConfigComponent },
      { path: 'notifications', component: NotificationsConfigComponent },
      { path: 'contacts', component: ContactsConfigComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
