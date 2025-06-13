import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from './workout.service';

import { User } from '../profile/user.model';
import { WorkoutListComponent } from './workout-plan-list/workout-plan-list.component';
import { WorkoutDayListComponent } from './workout-day-list/workout-day-list.component';

@Component({
  selector: 'app-workout',
  imports: [RouterOutlet, WorkoutListComponent],
  standalone: true,
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit, OnDestroy {
  user!: User;
  isLoading = true;
  private subscriptions = new Subscription();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.supabaseService.currentUser.subscribe((user) => {
        this.user = user;
        this.isLoading = false;
        if (this.user) {
          this.workoutService.getUserWorkoutPlans(this.user.id);
        }
      })
    );
  }

  get isOnNewRoute() {
    return this.router.url.endsWith('/new');
  }

  get isOnEditRoute() {
    return this.router.url.endsWith('/edit');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
