import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-demo',
  templateUrl: './app.html',
  imports: [ButtonModule, CheckboxModule],
})
export class App {
  
}
