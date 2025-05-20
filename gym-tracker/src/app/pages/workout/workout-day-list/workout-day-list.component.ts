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

@Component({
  selector: 'app-workout-day-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workout-day-list.component.html',
  styleUrl: './workout-day-list.component.css',
})
export class WorkoutDayListComponent implements OnInit {
  workoutId: string = '';
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
    private workoutService: WorkoutService
  ) {
    // console.log(this.selectedDay, this.selectedRoutine);
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.workoutId = params['id'];
      this.selectedDay = params['day'];
    });

    this.workoutService.workoutListChanged.subscribe((routine) => {
      this.selectedRoutine = routine;
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
