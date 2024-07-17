import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  post_Id: any;
  blog: any;
  errorMessage: string = '';

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) {
    this.post_Id = this.activatedRoute.snapshot.params['post_id'];
  }
  
  ngOnInit(): void {
    this.authService.getBlogById(this.post_Id).subscribe({
      next: (data: any) => {
        this.blog = data;
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.errorMessage = "Blog not found.";
        } else {
          this.errorMessage = "Error fetching blog. Please try again later.";
          console.error("Error fetching blog:", err);
        }
      }
    });
  }
  logout(): void {
    this.authService.logout();
  }
}