import { CommonModule, DatePipe, NgFor, NgForOf } from '@angular/common';
import { Component, Inject, NgModule, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditorComponent } from '../editor/editor.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';
import { TruncatePipe } from '../../truncate.pipe';

interface Post {
  post_Id: number;
  title: string;
  author: string;
  content: string;
  date_created: string;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, NgFor, CommonModule, DashboardComponent, FormsModule, TruncatePipe],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
  providers: [DatePipe]

})
export class SummaryComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  userId: number | null = null;
  searchTerm: string = '';
  showFilteredResults: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

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

  sortPosts(): void {
    this.posts.sort((a, b) => {
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      }
      if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      }
      return 0;
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

  deletePost(post_Id: number): void {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (confirmed) {
      this.http.post(`http://localhost/post/text/api/delete_post/${post_Id}`, {})
        .subscribe(
          () => {
            this.posts = this.posts.filter((post: any) => post.post_Id !== post_Id);
          },
          error => {
            console.error('Error deleting report:', error);
          }
        );
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
  