import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlarmActivationComponent } from './components/alarm-activation/alarm-activation.component';
import { AlarmCancellationComponent } from './components/alarm-cancellation/alarm-cancellation.component';
import { DeviceLockComponent } from './components/device-lock/device-lock.component';
import { AlarmRoutingModule } from './alarm-routing.module';
import { PostAlarmQuestionnaireComponent } from './components/post-alarm-questionnaire/post-alarm-questionnaire.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlarmActivationComponent,
    AlarmCancellationComponent,
    DeviceLockComponent,
    PostAlarmQuestionnaireComponent,
    AlarmRoutingModule
  ]
})
export class AlarmModule { }
