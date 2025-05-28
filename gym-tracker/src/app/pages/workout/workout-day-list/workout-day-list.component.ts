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
  user: any;
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

      await this.workoutService.getRoutineById(this.dayId);
    });

    this.workoutService.exerciseListChanged.subscribe((exercises) => {
      this.exercises = exercises;
      console.log('Exercises:', this.exercises);
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

  onDeleteExercise(exerciseId: string) {
    this.workoutService.deleteExercise(exerciseId, this.user.id);
    this.router.navigate([`/workouts/${this.workoutId}/${this.selectedDay}`]);
  }
}
