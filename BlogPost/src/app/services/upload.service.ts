// src/app/services/upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = 'http://localhost/post/text/api/addPost/${this.user_id}';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, userId: number, title: string, author: string, content: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId.toString());
    formData.append('title', title);
    formData.append('author', author);
    formData.append('content', content);

    return this.http.post(this.apiUrl, formData);
  }
}

