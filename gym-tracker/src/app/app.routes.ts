import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'workouts',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/workout/workout.component').then(
        (m) => m.WorkoutComponent
      ),
    children: [
      {
        path: 'new',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/workout/workout-edit/workout-edit.component').then(
            (m) => m.WorkoutEditComponent
          ),
      },
      // {
      //   path: ':id',
      //   canActivate: [AuthGuard],
      //   loadComponent: () =>
      //     import(
      //       './pages/workout/workout-detail/workout-detail.component'
      //     ).then((m) => m.WorkoutDetailComponent),
      // },
      {
        path: ':id/edit',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/workout/workout-edit/workout-edit.component').then(
            (m) => m.WorkoutEditComponent
          ),
      },
    ],
  },
  {
    path: 'progress',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/progress/progress.component').then(
        (m) => m.ProgressComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
];
