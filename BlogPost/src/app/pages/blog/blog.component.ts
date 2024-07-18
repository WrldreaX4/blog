import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  post: any = {};
  post_Id: number = 0;
  errorMessage: string = '';

  comments: any;
  commentForm!: FormGroup;
  fb: any;
  Id:number = 0;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.post_Id = parseInt(params.get('id')!, 10);
      if (!isNaN(this.post_Id)) {
        this.retrievePost(this.post_Id);

        this.commentForm = this.fb.group({
          postedBy: ["", Validators.required],
          content: ["", Validators.required]
        });
      }
    });
  }
  publishComment(): void {
    if (this.commentForm.valid) {
      const postedBy = this.commentForm.get("postedBy")?.value;
      const content = this.commentForm.get("content")?.value; // Corrected to use "content"

      this.authService.createComment(this.Id, postedBy, content).subscribe(
        () => {
          alert("Comment Published Successfully");
        },
        error => {
          console.error('Error publishing comment:', error);
          alert("Something Went Wrong!!!");
        }
      );
    } else {
      alert("Please fill out the form completely");
    }
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

  deletePost(post_Id: number): void {
    const confirmed = confirm('Are you sure you want to delete this Blog?');
    if (confirmed) {
      this.http.post(`http://localhost/post/text/api/delete_post/${post_Id}`, {})
        .subscribe(
          () => {
            this.router.navigate(['/dashboard']);
          },
          error => {
            console.error('Error deleting Blog:', error);
          }
        );
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