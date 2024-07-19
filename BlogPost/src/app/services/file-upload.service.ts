import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
  export class FileUploadService {
    private baseUrl = 'http://localhost:4000/post/text/api/upload'; // Adjust URL as needed

    constructor(private http: HttpClient) { }
  
    upload(file: File): Observable<HttpEvent<any>> {
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);
  
      const headers = new HttpHeaders({
        'Accept': 'application/json'
      });
  
      return this.http.post<HttpEvent<any>>(this.baseUrl, formData, {
        headers: headers,
        reportProgress: true,
        observe: 'events'
      });
    }
  }