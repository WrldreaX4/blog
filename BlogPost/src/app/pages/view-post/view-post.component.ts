import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileComponent } from '../profile/profile.component';
import { SummaryComponent } from '../summary/summary.component';
import { EditorComponent } from '../editor/editor.component';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Comment {
  Id: number;
  hasLiked: boolean;
  // Add other properties relevant to your comment
}

@Component({
  selector: 'app-view-post',
  standalone: true,
  imports: [ProfileComponent, SummaryComponent, EditorComponent, RouterLink, NgFor, NgIf, ReactiveFormsModule, NgClass],
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.css']
})
export class ViewPostComponent implements OnInit {

  post: any = {};
  post_Id: number = 0;
  addComment!: FormGroup;
  errorMessage: string = '';
  profileData: any = {};
  comments: any = [];
  user_id: number = 0;
  createBlog = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.addComment = this.formBuilder.group({
      postedBy: [''],
      content: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      this.post_Id = parseInt(params.get('id')!, 10);
      if (!isNaN(this.post_Id)) {
        this.authService.getCurrentUser().subscribe(user => {
          if (user) {
            this.user_id = user.id;
            this.retrieveProfileData();
          } else {
            console.log('No user logged in.');
            this.router.navigate(['/login']);
          }
        });
        this.retrievePost(this.post_Id);
        this.retrieveComments(this.post_Id);
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

  retrieveProfileData(): void {
    this.http.get(`http://localhost/post/text/api/get_profile/${this.user_id}`).subscribe(
      (resp: any) => {
        if (resp.data && resp.data.length > 0) {
          this.profileData = resp.data[0];
          this.addComment.get('postedBy')?.setValue(this.profileData.username);
        } else {
          console.error('No data available');
        }
      },
      (error) => {
        console.error('Error retrieving profile data', error);
      }
    );
  }

  retrievePost(post_Id: number): void {
    this.http.get(`http://localhost/post/text/api/postonly/${post_Id}`).subscribe(
      (resp: any) => {
        this.post = resp.data;
      },
      error => {
        console.error('Error fetching Blog:', error);
        this.errorMessage = 'Error fetching Blog';
      }
    );
  }

  retrieveComments(post_Id: number): void {
    this.http.get(`http://localhost/post/text/api/commentall/${post_Id}`).subscribe(
      (resp: any) => {
        this.comments = resp.data.map((comment: any) => {
          const commentDate = new Date(comment.date_created);
          comment.formattedTime = this.formatDateTime(commentDate);
          return comment;
        });
        this.loadLikesFromLocalStorage(); 
      },
      error => {
        console.error('Error fetching Comments:', error);
        this.errorMessage = 'Error fetching Comments';
      }
      
    );
  }

  deleteComment(Id: number): void {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (confirmed) {
      this.http.delete(`http://localhost/post/text/api/delete_comment/${Id}`, {})
        .subscribe(
          () => {
            this.comments = this.comments.filter((comment: any) => comment.Id !== Id);
          },
          error => {
            console.error('Error deleting Comment:', error);
          }
        );
    }
  }

  onSubmitComment(): void {
    if (this.addComment.valid) {
      const commentData = this.addComment.value;
      this.http.post(`http://localhost/post/text/api/post_comment/${this.post_Id}`, commentData)
        .subscribe(
          (resp: any) => {
            alert('Comment submitted successfully');
            this.retrieveComments(this.post_Id); // Refresh comments
            this.addComment.reset(); // Reset form after submission
          },
          (error: any) => {
            console.error('Error submitting Comment:', error);
          }
        );
    } else {
      alert('Please fill out the form completely');
    }
  }

  downloadPDF(): void {
    const blog = document.getElementById('blog-container');

    if (blog) {
      html2canvas(blog, { scale: 2, useCORS: true }).then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('BlogPost.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    } else {
      console.error('The blog container was not found.');
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleCreate() {
    this.createBlog = !this.createBlog;
  }
  
  toggleLikeAndCreate(Id: number) {
    this.likeComment(Id);
    this.toggleCreate();
  }
  
  likeComment(Id: number) {
    const comment = this.comments.find((comment: { Id: number; }) => comment.Id === Id);
    if (comment) {
      comment.hasLiked = !comment.hasLiked;
      this.saveLikeToLocalStorage(Id, comment.hasLiked);
    }
  }
  
  saveLikeToLocalStorage(Id: number, hasLiked: boolean) {
    const likes = JSON.parse(localStorage.getItem('likes') || '{}');
    likes[Id] = hasLiked;
    localStorage.setItem('likes', JSON.stringify(likes));
  }
  
  loadLikesFromLocalStorage() {
    const likes = JSON.parse(localStorage.getItem('likes') || '{}');
    this.comments.forEach((comment: { Id: string | number; hasLiked: any; }) => {
      if (likes[comment.Id] !== undefined) { // Make sure the key matches
        comment.hasLiked = likes[comment.Id];
      }
    });
  }
}
