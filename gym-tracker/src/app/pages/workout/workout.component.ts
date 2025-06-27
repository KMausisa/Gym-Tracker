import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from './workout.service';

import { User } from '../profile/user.model';

@Component({
  selector: 'app-workout',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit, OnDestroy {
  user!: User;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        this.isLoading = false;
        if (this.user) {
          this.workoutService.getUserWorkoutPlans(this.user.id);
        }
      });
  }

  get isOnNewRoute() {
    return (
      this.route.snapshot.routeConfig?.path === 'new' ||
      this.route.snapshot.routeConfig?.path === ':id'
    );
  }

  get isOnEditRoute() {
    return this.router.url.endsWith('/edit');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
