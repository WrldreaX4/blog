import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DatePipe, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface Post {
  post_Id: number;
  title: string;
  author: string;
  content: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterModule, RouterOutlet, NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  userId: number | null = null;
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

  retrievePosts(): void {
    this.http.get<any>(`http://localhost/post/text/api/postall/${this.userId}`).subscribe(
      (resp: any) => {
        console.log('Posts Retrieved:', resp); 
        this.posts = resp.data; // Assuming resp.data is an array of posts
        this.applySearchFilter(); // Apply search filter after retrieving posts
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