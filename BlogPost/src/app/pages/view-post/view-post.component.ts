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

@Component({
  selector: 'app-view-post',
  standalone: true,
  imports: [ProfileComponent, SummaryComponent, EditorComponent, RouterLink, NgFor, NgIf],
  templateUrl: './view-post.component.html',
  styleUrl: './view-post.component.css'
})
export class ViewPostComponent implements OnInit {

  post: any = {};
  post_Id: number = 0;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.post_Id = parseInt(params.get('id')!, 10);
      if (!isNaN(this.post_Id)) {
        this.retrievePost(this.post_Id);
      }
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
    const reportData = document.querySelector('.reportdata') as HTMLElement;

    if (reportData) {
      html2canvas(reportData, { scale: 2, useCORS: true }).then((canvas) => {
        const pdfWidth = canvas.width + 80;
        const pdfHeight = canvas.height + 80;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [pdfWidth, pdfHeight],
        });

        const margin = 40;
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', margin, margin, canvas.width, canvas.height);
        pdf.save('BlogPost.pdf');
      });
    } else {
      console.error('The report data container was not found.');
    }
  }

  logout(): void {
    // Implement your logout logic here
    // For example, if using AuthService, call logout method
    // this.authService.logout();
  }
}
