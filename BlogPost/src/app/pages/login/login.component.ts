import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule, DashboardComponent],
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

    const data = {
      email: this.email,
      password: this.password
    };

    this.authService.userLogin(data).subscribe(
      (response: any) => {
        console.log('Login Successful.', response);
        this.authService.setToken(response.jwt);
        this.router.navigate(['/dashboard']);
      },
      (error: any) => {
        this.errorMessage = error;
      }
    );
  }
}