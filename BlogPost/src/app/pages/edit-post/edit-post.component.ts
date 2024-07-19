import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, NgIf],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent {
  addBlog: FormGroup;
  post: any = {};
  profileData: any = {};
  user_id: number = 0;

  post_Id: number = 0;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute){
    this.addBlog = new FormGroup({
      title: new FormControl('', Validators.required), // Required field
      author: new FormControl('', [Validators.required, Validators.min(1900), Validators.max(2100)]), // Number validation
      content: new FormControl('', Validators.required), // Required field
      
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.post_Id = parseInt(params.get('id')!, 10);
      if (!isNaN(this.post_Id)) {
        this.retrievePost(this.post_Id);
      }
    });
  }


  retrievePost(id: number): void {
    this.http.get(`http://localhost/post/text/api/postonly/${id}`).subscribe(
      (resp: any) => {
        console.log(resp);
        this.post = resp.data;
        this.addBlog.patchValue(this.post); // Populate form with retrieved data
      },
      error => {
        console.error('Error fetching event report:', error);
      }
    );
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

  onSubmitPost(id: number): void {
    if (this.addBlog.valid) {
      const reportData = this.addBlog.value; // Use annualForm to extract values

      // Post data to the specified endpoint
      this.http.post(`http://localhost/post/text/api/edit_post/${id}`, reportData)
        .subscribe(
          (resp) => {
            console.log('Updated:', resp);

            this.router.navigate(['summary']);
            
          },
          (error) => {
            console.error('Error Submitting Report', error); // Handle errors
          }
        );
    } else {
      console.warn('Form is not valid. Check required fields.');
    }
  }
}


