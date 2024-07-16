import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  postForm: FormGroup;
  userId: number | null = null;

  @ViewChild('formContent')
  formContent!: ElementRef;
  datePipe: any;
  

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService) {
    this.postForm= this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      content: ['', Validators.required]
      
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
      this.http.post(`http://localhost/post/text/api/insert_post/${this.userId}`, reportData)
        .subscribe(
          (resp: any) => {
            console.log('Post submitted:', resp);
            this.router.navigate(['/dashboard']);
          },
          (error: any) => {
            console.error('Error submitting Blog:', error);
          }
        );
    } else {
      console.warn('Form is not valid. Please check required fields.');
    }
  }


  formatDate(date: Date): string {
    if (!date) {
        return '';
    }
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

  
  logout(): void {
    this.authService.logout();
  }

}
  
  
