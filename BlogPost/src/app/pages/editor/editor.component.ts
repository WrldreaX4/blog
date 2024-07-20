import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadService } from '../../services/upload.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  preview = '';
  addBlog: FormGroup;
  user_id: any;
  profileData: any = {};
  bannerPath: string = '';
  fileToUpload: File | null = null;
  content: string = ''; // Initialize with empty string
  title: string = ''; // Initialize with empty string
  author: string = ''; // Initialize with empty string

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.addBlog = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      author: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user_id = user.id;
        this.retrieveProfileData();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];
    if (this.fileToUpload) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  retrieveProfileData() {
    this.http.get(`http://localhost/post/text/api/get_profile/${this.user_id}`).subscribe(
      (resp: any) => {
        if (resp.data && resp.data.length > 0) {
          this.profileData = resp.data[0];
          this.addBlog.get('author')?.setValue(this.profileData.username);
        } else {
          console.error('No data available');
        }
      },
      (error) => {
        console.error('Error retrieving profile data', error);
      }
    );
  }

  onSubmitPost(): void {
    if (this.addBlog.valid) {
      const post = { 
        ...this.addBlog.value, 
        banner_image: this.bannerPath 
      };
      this.http.post(`http://localhost/post/text/api/insert_post/${this.user_id}`, post)
        .subscribe(
          (resp: any) => {
            alert('Post submitted successfully');
            if (this.fileToUpload) {
              this.uploadFile(); // Call uploadFile after successful post submission
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          (error: any) => {
            console.error('Error submitting post:', error);
          }
        );
    } else {
      console.warn('Form is not valid. Please check required fields.');
    }
  }

  uploadFile() {
    if (!this.fileToUpload || !this.user_id) {
      console.log('No file selected or user ID is missing.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload);
    formData.append('user_id', this.user_id.toString());
    formData.append('title', this.addBlog.get('title')?.value ?? '');
    formData.append('author', this.addBlog.get('author')?.value ?? '');
    formData.append('content', this.addBlog.get('content')?.value ?? '');

    this.http.post('http://localhost/post/text/api/addPost', formData)
        .subscribe(
            response => {
                console.log('Upload successful', response);
                this.router.navigate(['/dashboard']);
            },
            error => {
                console.error('Upload error', error);
            }
        );
  }

  logout(): void {
    this.authService.logout();
  }
}