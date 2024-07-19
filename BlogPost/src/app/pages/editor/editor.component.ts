import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  addBlog: FormGroup;
  user_id: any;
  profileData: any = {};
  bannerPath: string = ''; // Initialize with an empty string to handle banner image URL

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.addBlog = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      author: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user_id = user.id;
        console.log('User ID:', this.user_id);
        this.retrieveProfileData();
      } else {
        console.log('No user logged in.');
        this.router.navigate(['/login']); // Redirect to login if not authenticated
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  initializeEditor(): void {
    const bannerImage = document.querySelector('#banner-upload') as HTMLInputElement;
    const banner = document.querySelector('.banner') as HTMLDivElement;

    bannerImage.addEventListener('change', () => {
      this.uploadBannerImage(bannerImage);
    });

    if (this.bannerPath) {
      banner.style.backgroundImage = `url(${this.bannerPath})`;
    }
  }

  uploadBannerImage(uploadFile: HTMLInputElement): void {
    const file = uploadFile.files?.[0];
    if (file && file.type.includes('image')) {
        const formData = new FormData();
        formData.append('image', file);

        this.http.post('http://localhost/post/upload', formData, { responseType: 'text' }).subscribe(
            (data: string) => {
                console.log('Image uploaded, response data:', data);
                this.bannerPath = `${location.origin}/${data}`;
                const banner = document.querySelector('.banner') as HTMLDivElement;
                if (banner) {
                    banner.style.backgroundImage = `url(${this.bannerPath})`;
                }
            },
            (error: any) => {
                console.error('Error uploading banner image:', error);
            }
        );
    } else {
        alert('Please upload an image file.');
    }
}

retrieveProfileData() {
  this.http.get(`http://localhost/post/text/api/get_profile/${this.user_id}`).subscribe(
    (resp: any) => {
      console.log('Profile data:', resp);
      if (resp.data && resp.data.length > 0) {
        this.profileData = resp.data[0];  // Access the first element of the array
        // Set the author form control value to username
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
            banner_image: this.bannerPath // Include the banner image URL
        };
        this.http.post(`http://localhost/post/text/api/insert_post/${this.user_id}`, post)
            .subscribe(
                (resp: any) => {
                    alert('Post submitted successfully');
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
}
