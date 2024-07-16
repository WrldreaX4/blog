import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private authService: AuthService){
  
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  openNotif() {
    const container = document.getElementById('container');
    if (container) {
      container.style.opacity = '1';
    }
  
  }
  closeNotif() {
    const container = document.getElementById('container');
    if (container) {
      container.style.opacity = '0';
    }
  
  }
  }