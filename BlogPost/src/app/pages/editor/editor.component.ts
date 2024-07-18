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


  constructor(private authService: AuthService, private http: HttpClient, private formBuilder: FormBuilder, private router: Router) {
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
      } else {
        console.log('No user logged in.');
      }
    });
  }
  

  onSubmitPost(): void {
    if (this.addBlog.valid) {
      const post = this.addBlog.value;
      this.http.post(`http://localhost/post/text/api/insert_post/${this.user_id}`, post)
        .subscribe(
          (resp: any) => {
            alert('Post submitted Sucessfully');
            this.router.navigate(['/blogs/' + this.user_id]);
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
