import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { arrayGenerator } from '../../../../utils/constants.util';

@Component({
  selector: 'app-attemps-check',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './attemps-check.component.html',
  styleUrl: './attemps-check.component.css',
})
export class AttempsCheckComponent implements OnInit {
  @Input() maxAttempts: number = 3;
  @Input() remaining: number = this.maxAttempts;
  attempts: number[] = [];

  ngOnInit() {
    this.attempts = arrayGenerator(this.maxAttempts, 1);
  }
}
