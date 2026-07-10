import { Component, ElementRef, EventEmitter, Output, ViewChild, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';

interface Dot {
  id: number;
  cx: number;
  cy: number;
}

@Component({
  selector: 'app-pattern-touch',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './pattern-touch.component.html',
  styleUrls: ['./pattern-touch.component.css']
})
export class PatternTouchComponent implements OnInit {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGElement>;
  @Output() patternDrawn = new EventEmitter<number[]>();

  /**
   * Input opcional: prefija el patrón con una selección de puntos (ids)
   * Uso: <app-pattern-touch [pattern]="[0,1,2]"></app-pattern-touch>
   */
  @Input() set pattern(value: number[] | null) {
    if (value && Array.isArray(value)) {
      this.selectedDots = [...value];
      this.drawing = false;
      this.currentPointer = null;
    }
  }

  /** Si es false, el patrón es de solo lectura (no editable). */
  @Input() editable:boolean = true;

  dots: Dot[] = [];
  selectedDots: number[] = [];
  drawing = false;
  currentPointer: { x: number; y: number } | null = null;
  @Input() error: string | null = null;

  private svgRect: DOMRect | null = null;

  ngOnInit() {
    // Generar la cuadrícula 3x3 (espaciado de 100px, centro del primer punto en 50,50)
    const spacing = 100;
    const offset = 50;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.dots.push({
          id: row * 3 + col,
          cx: offset + col * spacing,
          cy: offset + row * spacing,
        });
      }
    }
  }

  /** Devuelve los puntos que forman la polilínea (incluyendo el segmento temporal mientras se arrastra) */
  get patternPoints(): string {
    let points = this.selectedDots.map((i) => `${this.dots[i].cx},${this.dots[i].cy}`).join(' ');
    if (this.drawing && this.currentPointer) {
      points += ` ${this.currentPointer.x},${this.currentPointer.y}`;
    }
    return points;
  }

  /** Comprueba si un punto está seleccionado */
  isSelected(dotId: number): boolean {
    return this.selectedDots.includes(dotId);
  }

  // ─── Manejo de ratón ──────────────────────────────────────
  onDotMouseDown(event: MouseEvent, dotId: number) {
    event.preventDefault();
    if (!this.editable) return;
    this.startDrawing(dotId);
    this.registerDocumentMouseEvents();
  }

  private registerDocumentMouseEvents() {
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      this.updatePointer(e.clientX, e.clientY);
    };
    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      this.finishDrawing();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ─── Manejo táctil ────────────────────────────────────────
  onDotTouchStart(event: TouchEvent, dotId: number) {
    event.preventDefault();
    if (!this.editable) return;
    this.startDrawing(dotId);
    this.registerDocumentTouchEvents();
  }

  private registerDocumentTouchEvents() {
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) this.updatePointer(touch.clientX, touch.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      this.finishDrawing();
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }

  // ─── Lógica común ─────────────────────────────────────────
  private startDrawing(dotId: number) {
    this.selectedDots = [dotId];
    this.drawing = true;
    this.currentPointer = null;
  }

  private updatePointer(clientX: number, clientY: number) {
    if (!this.svgRect) {
      this.svgRect = this.svgRef.nativeElement.getBoundingClientRect();
    }
    const x = clientX - this.svgRect.left;
    const y = clientY - this.svgRect.top;
    this.currentPointer = { x, y };
    this.checkDotHit(x, y);
  }

  /** Verifica si el puntero está sobre un punto no seleccionado y lo agrega al patrón */
  private checkDotHit(x: number, y: number) {
    const hitRadius = 25; // radio del área táctil
    for (const dot of this.dots) {
      if (this.selectedDots.includes(dot.id)) continue;
      const dx = dot.cx - x;
      const dy = dot.cy - y;
      if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
        this.selectedDots.push(dot.id);
        break; // agregamos uno a la vez
      }
    }
  }

  private finishDrawing() {
    this.drawing = false;
    this.currentPointer = null;
    this.svgRect = null;
    if (this.selectedDots.length > 0) {
      this.patternDrawn.emit([...this.selectedDots]);
    }
    // El patrón permanece visible hasta que se empiece uno nuevo.
  }

  /** Método público para limpiar el patrón externamente */
  clearPattern() {
    this.selectedDots = [];
    this.drawing = false;
    this.currentPointer = null;
  }

  /** Previene el comportamiento táctil por defecto en el SVG (scroll, zoom) */
  onSvgTouch(event: TouchEvent) {
    event.preventDefault();
  }
}
