import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = ''; // To store error message
  
  constructor(private authService: AuthService, private router: Router) {}
  
  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
  }
}
