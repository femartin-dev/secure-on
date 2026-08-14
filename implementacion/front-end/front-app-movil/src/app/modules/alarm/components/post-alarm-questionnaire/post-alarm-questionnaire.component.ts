import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type RatingControlName = 'evaluacionAutoridades' | 'evaluacionSistema';

@Component({
  selector: 'app-post-alarm-questionnaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-alarm-questionnaire.component.html',
  styleUrls: ['./post-alarm-questionnaire.component.css'],
})
export class PostAlarmQuestionnaireComponent {
  readonly stars = [1, 2, 3, 4, 5];

  readonly motivoOptions = [
    'Robo',
    'Emergencia médica',
    'Violencia',
    'Incendio',
    'Accidente',
    'Otro',
  ];

  readonly estadoSaludOptions = ['Ileso', 'Lesiones leves', 'Lesiones graves'];

  readonly autoridadesOptions = [
    'Policía',
    'Bomberos',
    'Ambulancia',
    'Defensa Civil',
    'Seguridad privada',
  ];

  form: FormGroup = this.fb.group({
    motivoActivacion: ['', Validators.required],
    descripcionIncidente: [''],
    estadoSaludPersona: ['', Validators.required],
    requiereAsistencia: [false],
    autoridadesContactadas: this.fb.control<string[]>([]),
    evaluacionAutoridades: [0],
    danosMateriales: [''],
    evaluacionSistema: [0],
    observaciones: [''],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  get autoridadesControl(): FormControl<string[]> {
    return this.form.get('autoridadesContactadas') as FormControl<string[]>;
  }

  toggleAutoridad(option: string): void {
    const current = this.autoridadesControl.value ?? [];
    const exists = current.includes(option);
    const next = exists ? current.filter((x) => x !== option) : [...current, option];
    this.autoridadesControl.setValue(next);
    this.autoridadesControl.markAsDirty();
  }

  removeAutoridad(option: string): void {
    const current = this.autoridadesControl.value ?? [];
    this.autoridadesControl.setValue(current.filter((x) => x !== option));
    this.autoridadesControl.markAsDirty();
  }

  isAutoridadSelected(option: string): boolean {
    return (this.autoridadesControl.value ?? []).includes(option);
  }

  setRating(controlName: RatingControlName, value: number): void {
    this.form.get(controlName)?.setValue(value);
    this.form.get(controlName)?.markAsDirty();
  }

  getStarIcon(value: number, star: number): 'star' | 'star_half' | 'star_outline' {
    if (value >= star) return 'star';
    if (value === star - 0.5) return 'star_half';
    return 'star_outline';
  }

  onCancelar(): void {
    this.router.navigate(['/main']);
  }

  onGuardarBorrador(): void {
    const payload = {
      ...this.form.getRawValue(),
      estado: 'BORRADOR',
    };
    // TODO: guardar borrador en API
    console.log('Borrador guardado:', payload);
    this.router.navigate(['/main']);
  }

  onGuardarDefinitivo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      estado: 'DEFINITIVO',
    };
    // TODO: guardar definitivo en API
    console.log('Cuestionario guardado:', payload);
    this.router.navigate(['/main']);
  }
}
