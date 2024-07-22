import { HttpClient } from '@angular/common/http';
import { Component, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TruncatePipe } from '../../truncate.pipe';
import { FormsModule, NgModel } from '@angular/forms';

interface Post {
  likes: any;
  hasLiked: any;
  post_Id: number;
  title: string;
  author: string;
  content: string;
  image_path: string;
  date_created: string;
  formattedTime?: string; // Optional property
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, NgClass, TruncatePipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  posts: Post[] = [];
  createBlog = false;
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

    return `${monthStr}-${dayStr}-${year}`;
  }

  formatTime12Hour(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return ` at ${hours} : ${formattedMinutes} ${ampm}`;
  }

  formatDateTime(date: Date): string {
    const datePart = this.formatDate(date);
    const timePart = this.formatTime12Hour(date);

    return `${datePart} ${timePart}`;
  }

  retrievePosts(): void {
    console.log('Fetching posts...');
    this.http.get<any>('http://localhost/post/text/api/getallpost').subscribe(
        (resp: any) => {
            console.log('Posts Retrieved:', resp);
            if (resp && resp.data) {
                this.posts = resp.data.map((post: Post) => {
                    console.log('Image Path:', post.image_path); // Verify the full URL
                    const postDate = new Date(post.date_created);
                    return {
                        ...post,
                        formattedTime: this.formatDateTime(postDate)
                    };
                });
                this.loadLikesFromLocalStorage();
                this.applySearchFilter();
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

  sharePost(post_Id: number): void {
    const post = this.posts.find(p => p.post_Id === post_Id);
    if (post) {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: 'Check out this blog post!',
          url: window.location.href
        }).then(() => {
          console.log('Thanks for sharing!');
        }).catch((error) => {
          console.error('Error sharing', error);
        });
      } else {
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
        window.open(shareUrl, '_blank');
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleCreate() {
    this.createBlog = !this.createBlog;
  }

  toggleLikeAndCreate(postId: number) {
    this.likePost(postId);
    this.toggleCreate();
  }

  likePost(post_Id: number) {
    const post = this.posts.find(p => p.post_Id === post_Id);
    if (post) {
      post.hasLiked = !post.hasLiked;
      this.saveLikeToLocalStorage(post_Id, post.hasLiked);
    }
  }

  saveLikeToLocalStorage(postId: number, hasLiked: boolean) {
    const likes = JSON.parse(localStorage.getItem('likes') || '{}');
    likes[postId] = hasLiked;
    localStorage.setItem('likes', JSON.stringify(likes));
  }

  loadLikesFromLocalStorage() {
    const likes = JSON.parse(localStorage.getItem('likes') || '{}');
    this.posts.forEach(post => {
      if (likes[post.post_Id] !== undefined) {
        post.hasLiked = likes[post.post_Id];
      }
    });
  }
}

