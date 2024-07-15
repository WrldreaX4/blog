import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { BlogComponent } from './pages/blog/blog.component';
import { EditorComponent } from './pages/editor/editor.component';

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
        path: 'editor',
        component: EditorComponent
    },
    {
        path: 'blog',
        component: BlogComponent
    },
];
