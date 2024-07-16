import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
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
export class DashboardComponent implements AfterViewInit, OnDestroy, OnInit {
  userId: number | null = null;
  postForm: Post[] = [];
  private userSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router,  
    private route: ActivatedRoute, 
    private authService: AuthService, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  logout(): void {
    this.authService.logout();
  }
  
  ngOnInit(): void {
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('User ID:', this.userId);
        this.retrievePost();
      } else {
        console.log('No user logged in.');
      }
    });
  }

  ngAfterViewInit(): void {
    // Add any required logic for after the view initializes
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  deletePost(post_Id: number): void {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      this.http.post(`http://localhost/post/text/api/delete_post`, { post_Id })
        .subscribe(
          () => {
            this.postForm = this.postForm.filter(post => post.post_Id !== post_Id);
          },
          error => {
            console.error('Error deleting post:', error);
          }
        );
    }
  }

  retrievePost(): void {
    if (this.userId !== null) {
      this.http.get(`http://localhost/post/text/api/postall/${this.userId}`).subscribe(
        (resp: any) => {
          console.log('Posts:', resp); 
          this.postForm = resp.data;
        },
        error => {
          console.error('Error retrieving posts:', error);
        }
      );
    }
  }
}
