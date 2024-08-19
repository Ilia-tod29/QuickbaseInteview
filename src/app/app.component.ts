import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FieldBuilderComponent } from './field-builder/field-builder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FieldBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'field-builder-app';
}
