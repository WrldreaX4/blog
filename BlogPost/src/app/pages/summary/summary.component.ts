import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { Component, Inject, NgModule, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditorComponent } from '../editor/editor.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';

interface Post {
  post_Id: number;
  title: string;
  author: string;
  content: string;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, NgFor, CommonModule, DashboardComponent, FormsModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
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
