import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlarmActivationComponent } from './components/alarm-activation/alarm-activation.component';
import { AlarmCancellationComponent } from './components/alarm-cancellation/alarm-cancellation.component';
import { DeviceLockComponent } from './components/device-lock/device-lock.component';

const routes: Routes = [
  { path: '', redirectTo: 'activation', pathMatch: 'full' },
  { path: 'activation', component: AlarmActivationComponent },
  { path: 'cancel', component: AlarmCancellationComponent },
  { path: 'lock', component: DeviceLockComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlarmRoutingModule { }
