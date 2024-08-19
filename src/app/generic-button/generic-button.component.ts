import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-button.component.html',
  styleUrl: './generic-button.component.scss'
})
export class GenericButtonComponent {
  @Input() label: string = 'Submit';
  @Input() loading: boolean = false;
  @Input() btnClass: string = 'btn';
  @Input() colorClass: string = 'btn-success'; 
  
  @Output() clicked = new EventEmitter<Event>();

  // Sends a signal that the button is clicked
  handleClick(event: Event) {
    this.clicked.emit(event);
  }
}
