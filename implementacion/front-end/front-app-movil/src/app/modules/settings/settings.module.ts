import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SettingsRoutingModule],
})
export class SettingsModule {}
