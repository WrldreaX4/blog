import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isBrowser, isLocalStorageAvailable } from '../shared/environment.utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getSummaries() {
    throw new Error('Method not implemented.');
  }

  private baseUrl = 'http://localhost/post/text';
  private tokenKey = 'jwt';
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  gotAllBlogs: any;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        this.currentUserSubject.next(this.decodeToken(token).data);
      }
    }
  }
  createComment(Id:number, postedBy:string, content:string) :Observable<any>{
    const params = {
      postId: Id,
      postedBy: postedBy,
      content: content
    }
    return this.http.delete(`${this.baseUrl}/api/comment/${Id}`).pipe(
      catchError(this.handleError)
 ) }

getAllCommentByPost(Id: number): Observable<any>{
  return this.http.get(`${this.baseUrl}/api/comments/${Id}`);
}

  getBlogById(post_Id: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/${post_Id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllBlogs(): Observable<any> {
    return this.http.get(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  createBlog(blogData: Partial<{ title: string | null; author: string | null; content: string | null; }>): Observable<any> {
    return this.http.post<any>(this.baseUrl, blogData).pipe(
      catchError(this.handleError)
    );
  }

  updateBlog(post_Id: any, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${post_Id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteBlog(post_Id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${post_Id}`).pipe(
      catchError(this.handleError)
    );
  }

  userLogin(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login.php`, data).pipe(
      catchError(this.handleError)
    );
  }

  userSignUp(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signup.php`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.error && error.error.includes('<!DOCTYPE html>')) {
        errorMessage = 'Server returned an HTML error page.';
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'Invalid username or password.';
            break;
          case 404:
            errorMessage = 'No user matched.';
            break;
          default:
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      localStorage.setItem(this.tokenKey, token);
      this.currentUserSubject.next(this.decodeToken(token).data);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      localStorage.removeItem(this.tokenKey);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Decode the JWT token
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token format:', e);
      return null;
    }
  }

  // Check if the token is expired
  private isTokenExpired(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (decodedToken && decodedToken.exp) {
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      return expirationDate < new Date();
    }
    return true;
  }

  // userid getter
  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }
}
