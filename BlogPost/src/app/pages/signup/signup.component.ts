import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, DashboardComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username: string = '';
    email: string = '';
    password: string = '';
    errorMessage: string = ''; 
    
    constructor(private authService: AuthService, private router: Router) {}

    onSignup() {
      if (!this.username || !this.email || !this.password) {
        alert('Please fill in all fields');
        return;
      }

      const data = {
        username: this.username,
        email: this.email,
        password: this.password,
      };

      this.authService.userSignUp(data).subscribe(
        (response: any) => {
          console.log(response.message);
          this.authService.setToken(response.jwt);
          this.router.navigate(['/login']);
        },
        (error: any) => {
          if (error.status === 409) {
            alert('Email already exists.');
          } else if (error.status === 400) {
            alert('Please provide all required fields.');
          } else {
            alert('An unexpected error occurred. Please try again later.');
          }
        }
      );
    }
  }