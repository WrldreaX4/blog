import { Component, OnInit } from '@angular/core';

import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, FormsModule, ReactiveFormsModule, CommonModule],

  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileData: any = {};
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  currentPasswordError: string = '';
  newPasswordError: string = '';

  userId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('User ID:', this.userId);
        this.retrieveProfileData();
      } else {
        console.log('No user logged in.');
      }
    });
  }

  clearPasswordFields() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  retrieveProfileData() {
    this.http.get(`https://gcccsarco.online/arcoapi/api/profilepage/${this.userId}`).subscribe(
      (resp: any) => {
        console.log('Profile data:', resp);
        if (resp.data && resp.data.length > 0) {
          this.profileData = resp.data[0];  // Access the first element of the array
        } else {
          console.error('No data available');
        }
      },
      (error) => {
        console.error('Error retrieving profile data', error);
      }
    );
  }

validatePasswords() {
  this.currentPasswordError = '';
  this.newPasswordError = '';

  this.http.post(`https://gcccsarco.online/arcoapi/api/validate_password/${this.userId}`, { currentPassword: this.currentPassword }).subscribe(
    (resp: any) => {
      if (resp.status.remarks !== 'success') {
        this.currentPasswordError = 'Current password is incorrect.';
      } else if (this.newPassword !== this.confirmNewPassword) {
        this.newPasswordError = 'New passwords do not match.';
      } else {
        this.updatePassword();
      }
    },
    (error) => {
      this.currentPasswordError = 'Error validating current password.';
      console.error('Error validating password:', error);
    }
  );
}

updateUsernameAndEmail() {
  const data = {
    username: this.profileData.username,
    email: this.profileData.email
  };

  this.http.post(`https://gcccsarco.online/arcoapi/api/edit_profile/${this.userId}`, data).subscribe(
    (resp: any) => {
      console.log('Profile updated successfully');
    },
    (error) => {
      console.error('Error updating profile', error);
    }
  );
}

updatePassword() {
  if (this.newPassword !== this.confirmNewPassword) {
    this.newPasswordError = 'New passwords do not match.';
    return;
  }

  this.http.post(`https://gcccsarco.online/arcoapi/api/validate_password/${this.userId}`, { currentPassword: this.currentPassword }).subscribe(
    (resp: any) => {
      if (resp.status.remarks !== 'success') {
        this.currentPasswordError = 'Current password is incorrect.';
      } else {
        const data = { password: this.newPassword };
        this.http.post(`https://gcccsarco.online/arcoapi/api/edit_profile/${this.userId}`, data).subscribe(
          (response: any) => {
            console.log('Password updated successfully');
            this.clearPasswordFields();
          },
          (error) => {
            console.error('Error updating password', error);
          }
        );
      }
    },
    (error) => {
      this.currentPasswordError = 'Error validating current password.';
      console.error('Error validating password:', error);
    }
  );
}


logout(): void {
  this.authService.logout();
}
}