import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  postForm: FormGroup;
  userId: number | null = null;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
      this.postForm = new FormGroup({
        title: new FormControl('', Validators.required), // Required field
        author: new FormControl('', [Validators.required, Validators.min(1900), Validators.max(2100)]), // Number validation
        content: new FormControl('', Validators.required), // Required field
      });
    }

 ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('User ID:', this.userId);
      } else {
        console.log('No user logged in.');
      }
    });
  }

  submitAndNavigate() {
    if (this.postForm.valid) {
      const reportData = this.postForm.value; 

      if (this.userId !== null) {
        const endpoint = `http://localhost/post/text/api/post/${this.userId}`;
        
        
        this.http.post(endpoint, reportData)
          .subscribe(
            (resp) => {
              console.log('Post submitted:', resp);

              this.router.navigate(['/dashboard']);
            },
            (error) => {
              console.error('Error Submitting Blog', error); 
            }
          );
      } else {
        console.error('User ID is not set.');
      }
    } else {
      console.warn('blog is not valid. Check required fields.');
    }
  }

  
  logout(): void {
    this.authService.logout();
  }

}
  
  
