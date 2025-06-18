import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { SupabaseService } from '../../../services/supabase.service';
import { WorkoutService } from '../../workout/workout.service';
import { User } from '../../profile/user.model';
import { ExerciseProgress } from '../../../models/exercise_progress.model';

@Component({
  selector: 'app-exercise-progress',
  imports: [NgChartsModule, CommonModule],
  templateUrl: './progress-exercise.component.html',
  styleUrls: ['./progress-exercise.component.css'],
})
export class ExerciseProgressComponent implements OnInit, OnDestroy {
  user!: User;
  exerciseId!: string;

  exerciseList: ExerciseProgress[] = [];

  exerciseProgress: ExerciseProgress[] = [];

  chartType: 'scatter' = 'scatter';
  chartDataList: any[] = [];
  maxWeightChartDataList: any[] = [];
  chartOptions: any = {};
  maxWeightChartOptions: any = {};
  term: string = '';

  private routeSub!: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.exerciseId = params.get('exerciseId')!;
      // Fetch data for the new exerciseId here
      this.supabaseService.currentUser.subscribe((user) => {
        this.user = user;
        if (this.user) {
          this.workoutService.getExerciseProgress(
            this.user.id,
            this.exerciseId
          );
        }
      });
      this.workoutService.exerciseProgressChanged.subscribe((progress) => {
        this.exerciseList = progress;
        this.prepareChartData();
      });
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  prepareChartData() {
    const totalVolume = this.exerciseList.map((exercise) => {
      const weights: number[] = Array.isArray(exercise.weights)
        ? exercise.weights
        : [exercise.weights];
      const reps: number[] = Array.isArray(exercise.reps)
        ? exercise.reps
        : [exercise.reps];
      return weights.reduce(
        (sum, weight, index) => sum + weight * (reps[index] ?? 0),
        0
      );
    });

    const dataPoints = this.exerciseList.map((s, i) => ({
      x: s.created_at,
      y: totalVolume[i],
    }));

    // Prepare chart data
    this.chartDataList = [
      {
        datasets: [
          {
            label: 'Total Volume',
            data: dataPoints,
            borderColor: 'black',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            showLine: false, // No connecting line
            pointRadius: 5,
          },
        ],
      },
    ];

    // Chart options for time x-axis
    const singleDate = new Date(this.exerciseList[0]?.created_at ?? '');
    const minDate = new Date(singleDate);
    minDate.setDate(minDate.getDate() - 1);
    const maxDate = new Date(singleDate);
    maxDate.setDate(maxDate.getDate() + 1);

    this.chartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM dd, yyyy',
            displayFormats: {
              day: 'MMM dd',
            },
          },
          title: {
            display: true,
            text: 'Date',
          },
          ticks: {
            source: 'data',
            autoSkip: false,
            maxTicksLimit: 1,
            // Optionally, format the tick label
            callback: function (value: any) {
              // value is a timestamp, format as date string
              return new Date(value).toLocaleDateString();
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Total Volume',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Exercise Volume Over Time',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              // Find the original exercise session
              const idx = context.dataIndex;
              const exercise = this.exerciseList[idx];
              // Format weights and reps for display
              const weights = Array.isArray(exercise.weights)
                ? exercise.weights
                : [exercise.weights];
              const reps = Array.isArray(exercise.reps)
                ? exercise.reps
                : [exercise.reps];
              const sets = weights.map(
                (w, i) => `Set ${i + 1}: ${w} lbs x ${reps[i] ?? 0} reps`
              );
              const formattedDate = exercise.created_at
                ? new Date(exercise.created_at).toLocaleDateString()
                : 'Unknown date';
              return [
                `Volume: ${context.parsed.y}`,
                `Date: ${formattedDate}`,
                ...sets,
              ];
            },
          },
        },
      },
    };

    const maxWeightPerSession = this.exerciseList.map((exercise) => {
      const weights: number[] = Array.isArray(exercise.weights)
        ? exercise.weights
        : [exercise.weights];
      // Find the max weight for this session
      return Math.max(...weights, 0);
    });

    const maxWeightDataPoints = this.exerciseList.map((s, i) => ({
      x: s.created_at,
      y: maxWeightPerSession[i],
    }));

    this.maxWeightChartDataList = [
      {
        datasets: [
          {
            label: 'Best Set (Max Weight)',
            data: maxWeightDataPoints,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            showLine: false,
            pointRadius: 5,
          },
        ],
      },
    ];

    this.maxWeightChartOptions = {
      ...this.chartOptions,
      scales: {
        ...this.chartOptions.scales,
        y: {
          ...this.chartOptions.scales.y,
          title: {
            display: true,
            text: 'Max Weight (lbs)',
          },
        },
      },
      plugins: {
        ...this.chartOptions.plugins,
        title: {
          display: true,
          text: 'Best Set (Max Weight) Per Session',
        },
      },
    };
  }
}
