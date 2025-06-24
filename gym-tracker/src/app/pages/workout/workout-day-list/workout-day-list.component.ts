import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';

import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterModule,
  RouterOutlet,
  Router,
} from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';
import { User } from '../../profile/user.model';
import { Exercise } from '../../../models/exercise.model';

@Component({
  selector: 'app-workout-day-list',
  standalone: true,
  imports: [FormsModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './workout-day-list.component.html',
  styleUrl: './workout-day-list.component.css',
})
export class WorkoutDayListComponent implements OnInit {
  user!: User;
  workoutId: string = '';
  dayId: string = '';
  exercises: Exercise[] = [];
  selectedDay: string = '';
  isLoading: boolean = false;
  @Output() workoutSelected = new EventEmitter<any[]>();

  exerciseName: string = '';
  sets: number = 0;
  reps: number = 0;
  weight: number = 0;
  notes: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private workoutService: WorkoutService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
    });

    this.route.params.subscribe(async (params) => {
      this.workoutId = params['id'];
      this.selectedDay = params['day'];

      this.dayId = await this.supabaseService.getDayId(
        this.workoutId,
        this.selectedDay
      );
      this.loadExercisesForDay(this.dayId);
    });
  }

  selectWorkout(workout: any) {
    this.workoutSelected.emit(workout);
  }

  // Helper getter to check if on 'add' route
  get isOnAddRoute(): boolean {
    return this.router.url.endsWith('/add');
  }

  get isOnEditRoute(): boolean {
    return this.router.url.includes('/edit');
  }

  async loadExercisesForDay(dayId: string) {
    this.isLoading = true;
    this.exercises = []; // Reset to prevent flicker

    const routine = await this.workoutService.getRoutineById(dayId);

    // Only update exercises if routine was fetched
    this.exercises = routine ?? [];
    this.isLoading = false;
  }

  onDeleteExercise(exerciseId: string) {
    this.workoutService.deleteExercise(exerciseId, this.user.id).then(() => {
      this.loadExercisesForDay(this.dayId);
    });
    this.router.navigate([`/workouts/${this.workoutId}/${this.selectedDay}`]);
  }

  goBack() {
    this.location.back();
  }
}
