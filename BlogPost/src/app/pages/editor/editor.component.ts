import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  currentFile?: File;
  message = '';
  preview = '';

  addBlog: FormGroup;
  user_id: any;
  profileData: any = {};
  bannerPath: string = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private uploadService: FileUploadService
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

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);
      if (file) {
        this.preview = '';
        this.currentFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.preview = e.target.result;
        };
        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  upload(): void {
    if (this.currentFile) {
      this.uploadService.upload(this.currentFile).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Handle upload progress
            const percentDone = Math.round(100 * event.loaded / (event.total ?? 1));
            console.log('Upload progress:', percentDone + '%');
          } else if (event instanceof HttpResponse) {
            // Handle upload completion
            console.log('Upload response:', event.body);
            if (event.body && event.body.path) {
              this.bannerPath = event.body.path;
            } else {
              console.error('Response does not contain a path');
            }
          } else {
            console.log('Unexpected event type:', event);
          }
        },
        error: (err: any) => {
          console.error('Error uploading file:', err);
          console.error('Error message:', err.message); // Log the error message
          console.error('Error name:', err.name); // Log the error name
          this.message = err.error?.message || 'Could not upload the image!';
        },
        complete: () => {
          this.currentFile = undefined;
        }
      });
    }
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
            this.router.navigate(['/dashboard']);
          },
          (error: any) => {
            console.error('Error submitting post:', error);
          }
        );
    } else {
      console.warn('Form is not valid. Please check required fields.');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
