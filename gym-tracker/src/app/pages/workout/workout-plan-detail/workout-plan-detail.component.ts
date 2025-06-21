import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WorkoutPlan } from '../../../models/workout_plan.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { WorkoutService } from '../workout.service';

@Component({
  selector: 'app-workout-plan-detail',
  imports: [RouterModule],
  templateUrl: './workout-plan-detail.component.html',
  styleUrl: './workout-plan-detail.component.css',
})
export class WorkoutPlanDetailComponent implements OnInit {
  selectedWorkoutId: string = '';
  workoutPlan!: WorkoutPlan | null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private workoutService: WorkoutService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.selectedWorkoutId = params['id'];
    });

    this.workoutPlan = await this.workoutService.getWorkoutPlanById(
      this.selectedWorkoutId
    );

    console.log("User's selected workout plan: ", this.workoutPlan);
  }

  viewDayExercises(day: string) {}

  editworkoutPlan() {}

  confirmDelete(workoutId: string | undefined) {}

  activateworkoutPlan() {}

  deactivateworkoutPlan() {}

  goBack() {
    this.location.back();
  }
}
