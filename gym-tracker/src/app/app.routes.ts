import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        path: 'home',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'workout',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/workout/workout.component').then(m => m.WorkoutComponent)
    },
    {
        path: 'progress',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent)
    },
    {
        path: 'account',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    }
];
