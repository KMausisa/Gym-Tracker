import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WorkoutPlan } from '../../../models/workout_plan.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { WorkoutService } from '../workout.service';
import { NavigationService } from '../../../services/navigation-service.service';

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
    private router: Router,
    private location: Location,
    private navService: NavigationService,
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

  goBack() {
    const prevUrl = this.navService.getPreviousUrl();
    const workoutId = this.workoutPlan?.id; // assuming you have this available

    if (prevUrl && /\/workouts\/\d+\/(add|edit)/.test(prevUrl)) {
      this.router.navigate(['/workouts', workoutId]);
    } else {
      this.location.back();
    }
  }
}
