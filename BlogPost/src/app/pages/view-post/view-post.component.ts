import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileComponent } from '../profile/profile.component';
import { SummaryComponent } from '../summary/summary.component';
import { EditorComponent } from '../editor/editor.component';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-view-post',
  standalone: true,
  imports: [ProfileComponent, SummaryComponent, EditorComponent, RouterLink, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.css']
})
export class ViewPostComponent implements OnInit {

  post: any = {};
  post_Id: number = 0;
  addComment!: FormGroup;
  errorMessage: string = '';

  comments: any = {};
  user_id: number = 0;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private authService: AuthService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.post_Id = parseInt(params.get('id')!, 10);
      if (!isNaN(this.post_Id)) {
        this.retrievePost(this.post_Id);
        this.retrieveComments(this.post_Id);
      }
    });

    // Initialize the comment form
    this.addComment = this.formBuilder.group({
      postedBy: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  retrievePost(post_Id: number): void {
    this.http.get(`http://localhost/post/text/api/postonly/${post_Id}`).subscribe(
      (resp: any) => {
        console.log(resp);
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
        console.log(resp);
        this.comments = resp.data;
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
}
