import { Component, OnInit } from '@angular/core';

import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Post {
  post_Id: number;
  title: string;
  author: string;
  content: string;
  date_created: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  providers: [DatePipe]

})
export class ProfileComponent implements OnInit {
  profileData: any = {};
  posts: Post[] = [];
  recentPosts: Post[] = [];
  user_id: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService, private datePipe: DatePipe,) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user_id = user.id;
        console.log('User ID:', this.user_id);
        this.retrieveProfileData();
        this.retrievePosts();
      } else {
        console.log('No user logged in.');
      }
    });
  }

  retrieveProfileData() {
    this.http.get(`http://localhost/post/text/api/get_profile/${this.user_id}`).subscribe(
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

  retrievePosts(): void {
    this.http.get<any>(`http://localhost/post/text/api/postall/${this.user_id}`).subscribe(
      (resp: any) => {
        console.log('Posts Retrieved:', resp);
        this.posts = resp.data; // Assuming resp.data is an array of posts
        this.setRecentPosts();
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }
  formatDate(date: string): string | null {
    const transformedDate = this.datePipe.transform(date, 'EEEE'); // Output like "Sunday, May 17, 2023"
    return transformedDate !== null ? transformedDate : null;
  }

  formatDate1(date: string): string | null {
    const transformedDate = this.datePipe.transform(date, 'd');  // Output like "17"
    return transformedDate !== null ? transformedDate : null;
  }

  formatDate2(date: string): string | null {
    const transformedDate = this.datePipe.transform(date, 'MMMM d');  // Output like "May 17"
    return transformedDate !== null ? transformedDate : null;
  }
  setRecentPosts(): void {
    // Sort posts by date_created and take the 5 most recent ones
    this.recentPosts = this.posts
      .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
      .slice(0, 5);
  }

  logout(): void {
    this.authService.logout();
  }
}