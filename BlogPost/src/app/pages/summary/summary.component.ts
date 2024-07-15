import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, NgFor, CommonModule, DashboardComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {

  constructor(private authService: AuthService){
  
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  }
