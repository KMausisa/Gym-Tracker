import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterModule,
  RouterOutlet,
  Router,
} from '@angular/router';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-workout-day-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workout-day-list.component.html',
  styleUrl: './workout-day-list.component.css',
})
export class WorkoutDayListComponent implements OnInit {
  workoutId: string = '';
  dayId: string = '';
  exercises: any[] = [];
  selectedRoutine: any = null;
  selectedDay: string = '';
  @Output() workoutSelected = new EventEmitter<any[]>();

  exerciseName: string = '';
  sets: number = 0;
  reps: number = 0;
  weight: number = 0;
  notes: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private supabaseService: SupabaseService
  ) {
    // console.log(this.selectedDay, this.selectedRoutine);
  }

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.workoutId = params['id'];
      this.selectedDay = params['day'];

      this.dayId = await this.supabaseService.getDayId(
        this.workoutId,
        this.selectedDay
      );

      // Fetch exercises for this workout and day
      this.workoutService.getRoutineById(this.dayId).then((exercises) => {
        this.exercises = Array.isArray(exercises)
          ? exercises
          : exercises
          ? [exercises]
          : [];
      });
    });

    this.workoutService.workoutListChanged.subscribe((routine) => {
      this.selectedRoutine = routine;
    });

    this.workoutService.exerciseListChanged.subscribe((exercises) => {
      this.exercises = exercises;
    });
  }

  // Submit exercise form
  onSubmit() {}

  selectWorkout(workout: any) {
    console.log('Workout selected:', workout);
    this.workoutSelected.emit(workout);
  }

  // Helper getter to check if on 'add' route
  get isOnAddRoute(): boolean {
    return this.router.url.endsWith('/add');
  }
}
