import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { BlogComponent } from './pages/blog/blog.component';
import { EditorComponent } from './pages/editor/editor.component';
import { SummaryComponent } from './pages/summary/summary.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
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
    {
        path: 'summary',
        component: SummaryComponent
    },
];
