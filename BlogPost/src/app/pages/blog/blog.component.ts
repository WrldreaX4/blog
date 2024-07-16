import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  postForm: any = {};
  data: any;

  userId: number | null = null;



  constructor(private http: HttpClient, private authService: AuthService){
  }


  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('User ID:', this.userId);
        this.retrievePost();
      } else {
        console.log('No user logged in.');
      }
    });
  }

  retrievePost() {
    if (this.userId !== null) {
      this.http.get(`http://localhost/post/text/api/get_post/${this.userId}`).subscribe(
        (resp: any) => {
          console.log(resp);
          this.data = resp.payload;
          this.postForm = resp.data;
        }, (error) => {
          console.error('Error fetching data:', error);
        }
      );
    } else {
      console.error('User ID is not set.');
    }
  }
  
  logout(): void {
    this.authService.logout();
  }

}