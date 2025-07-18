import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { AuthRedirectGuard } from './services/auth-redirect.guard';
import { CanExitWorkoutGuard } from './services/can-exit-workout.guard';
import { SessionResolver } from './services/session-resolver.service';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    resolve: { session: SessionResolver },
    canDeactivate: [CanExitWorkoutGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'workouts',
    canActivate: [AuthGuard],
    resolve: { session: SessionResolver },
    loadComponent: () =>
      import('./pages/workout/workout.component').then(
        (m) => m.WorkoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/workout/workout-plan-list/workout-plan-list.component'
          ).then((m) => m.WorkoutListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './pages/workout/workout-plan-edit/workout-plan-edit.component'
          ).then((m) => m.WorkoutEditComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './pages/workout/workout-plan-detail/workout-plan-detail.component'
          ).then((m) => m.WorkoutPlanDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            './pages/workout/workout-plan-edit/workout-plan-edit.component'
          ).then((m) => m.WorkoutEditComponent),
      },
      {
        path: ':id/:day',
        loadComponent: () =>
          import(
            './pages/workout/workout-day-list/workout-day-list.component'
          ).then((m) => m.WorkoutDayListComponent),
        children: [
          {
            path: 'add',
            // load workout-day-edit component
            loadComponent: () =>
              import(
                './pages/workout/workout-day-edit/workout-day-edit.component'
              ).then((m) => m.WorkoutDayEditComponent),
          },
          {
            path: ':exerciseId/edit',
            // load workout-day-edit component
            loadComponent: () =>
              import(
                './pages/workout/workout-day-edit/workout-day-edit.component'
              ).then((m) => m.WorkoutDayEditComponent),
          },
        ],
      },
    ],
  },
  {
    path: 'progress',
    canActivate: [AuthGuard],
    resolve: { session: SessionResolver },
    loadComponent: () =>
      import('./pages/progress/progress.component').then(
        (m) => m.ProgressComponent
      ),
    children: [
      {
        path: ':exerciseId',
        loadComponent: () =>
          import(
            './pages/progress/progress-exercise/progress-exercise.component'
          ).then((m) => m.ExerciseProgressComponent),
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    resolve: { session: SessionResolver },
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'profile/:userId/edit',
    canActivate: [AuthGuard],
    resolve: { session: SessionResolver },
    loadComponent: () =>
      import('./pages/profile/profile-edit/profile-edit.component').then(
        (m) => m.ProfileEditComponent
      ),
  },
  {
    path: 'login',
    canActivate: [AuthRedirectGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [AuthRedirectGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
];
