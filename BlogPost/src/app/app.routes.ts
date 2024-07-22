import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BlogComponent } from './pages/blog/blog.component';
import { EditorComponent } from './pages/editor/editor.component';
import { SummaryComponent } from './pages/summary/summary.component';
import { ViewPostComponent } from './pages/view-post/view-post.component';
import { EditPostComponent } from './pages/edit-post/edit-post.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
    },
      {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'editor',
        component: EditorComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'blog/:id',
        component: BlogComponent
    },
    {
        path: 'summary',
        component: SummaryComponent
    },
    {
        path: 'blogs/:id',
        component: ViewPostComponent
    },
    {
        path: 'editblog/:id',
        component: EditPostComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        path: 'view-post',
        component: ViewPostComponent
    },
];
