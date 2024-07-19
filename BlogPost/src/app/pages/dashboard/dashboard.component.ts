import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DatePipe, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TruncatePipe } from '../../truncate.pipe';

interface Post {
  post_Id: number;
  title: string;
  author: string;
  content: string;
  date_created: string;
  formattedTime?: string; // Optional property
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterModule, RouterOutlet, NgFor, NgIf, DatePipe, FormsModule, TruncatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  userId: number | null = null;
  postId: number | null = null;
  searchTerm: string = '';
  showFilteredResults: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('User ID:', this.userId);
        this.retrievePosts();
      } else {
        console.log('No user logged in.');
      }
    });
  }


  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    
    // Add leading zeroes for single digit day or month
    const dayStr = day < 10 ? `0${day}` : day;
    const monthStr = month < 10 ? `0${month}` : month;
    
    return `${monthStr}/${dayStr}/${year}`;
  }
  
  formatTime12Hour(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  }
  
  formatDateTime(date: Date): string {
    const datePart = this.formatDate(date);
    const timePart = this.formatTime12Hour(date);
    
    return `${datePart} ${timePart}`;
  }
  
  retrievePosts(): void {
    console.log('Fetching posts...');
    this.http.get<any>('http://localhost/post/text/api/allpost').subscribe(
      (resp: any) => {
        console.log('Posts Retrieved:', resp); 
        if (resp && resp.data) {
          this.posts = resp.data.map((post: Post) => {
            // Assuming post.date_created is a string; convert to Date object
            const postDate = new Date(post.date_created);
            return {
              ...post,
              formattedTime: this.formatDateTime(postDate) // Add formatted time
            };
          });
          this.applySearchFilter(); // Apply search filter after retrieving posts
        } else {
          console.error('Invalid response format:', resp);
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }
  
  

  applySearchFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter(post => post.title.toLowerCase().includes(term));
    this.showFilteredResults = true;
  }

  logout(): void {
    this.authService.logout();
  }
}