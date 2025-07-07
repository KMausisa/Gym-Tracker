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
  }

  /**
   * Navigates back to the previous page or workout list.
   * If the previous URL is a workout add/edit page, it navigates to the workout detail page.
   * Otherwise, it uses the browser's back functionality.
   */
  goBack() {
    const prevUrl = this.navService.getPreviousUrl();
    const workoutId = this.workoutPlan?.id;

    if (prevUrl && /\/workouts\/\d+\/(add|edit)/.test(prevUrl)) {
      this.router.navigate(['/workouts', workoutId]);
    } else {
      this.location.back();
    }
  }
}
