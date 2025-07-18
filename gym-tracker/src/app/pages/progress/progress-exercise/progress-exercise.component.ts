import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartType, plugins } from 'chart.js';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  exerciseProgress: ExerciseProgress[] = [];
  exerciseHasProgress: boolean = false;

  chartType: 'scatter' = 'scatter';
  chartDataList: any[] = [];
  maxWeightChartDataList: any[] = [];
  chartOptions: any = {};
  maxWeightChartOptions: any = {};
  term: string = '';

  destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.exerciseId = params.get('exerciseId')!;

      // Fetch data for the new exerciseId here
      this.supabaseService.currentUser
        .pipe(takeUntil(this.destroy$))
        .subscribe((user) => {
          this.user = user;
          if (this.user) {
            this.workoutService.getExerciseProgress(
              this.user.id,
              this.exerciseId
            );
          }
        });
      this.workoutService.exerciseProgressChanged
        .pipe(takeUntil(this.destroy$))
        .subscribe((progress) => {
          this.exerciseProgress = progress;
          this.prepareChartData();
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filters the exercise progress based on the search term.
   * @returns {ExerciseProgress[]} - Filtered exercise progress.
   */
  prepareChartData() {
    this.exerciseHasProgress = this.exerciseProgress.length > 0;
    const totalVolume = this.exerciseProgress.map((exercise) => {
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

    const dataPoints = this.exerciseProgress.map((s, i) => ({
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
            showLine: false,
            spanGaps: false,
            pointRadius: 5,
            pointBorderWidth: 1,
            pointStyle: 'circle', // Ensure it’s a dot, not a vertical bar
          },
        ],
      },
    ];

    // Chart options for time x-axis
    const dates = this.exerciseProgress
      .map((e) => (e.created_at ? new Date(e.created_at) : null))
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Add padding — e.g. 1 day before and after
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 2);

    this.chartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          min: minDate,
          max: maxDate,
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
            color: '#000000',
          },
          grid: {
            drawTicks: true,
            drawOnChartArea: false, // disables vertical gridlines (if you want to try)
          },
          ticks: {
            source: 'data',
            autoSkip: false,
            maxTicksLimit: 1,
            color: '#000000',
            callback: function (value: any) {
              const date = new Date(value);
              return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Total Volume',
            color: '#000000',
          },
          ticks: {
            color: '#000000',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#000000',
          },
        },
        title: {
          display: true,
          text: 'Exercise Volume Over Time',
          color: '#000000',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const idx = context.dataIndex;
              const exercise = this.exerciseProgress[idx];
              const weights = Array.isArray(exercise.weights)
                ? exercise.weights
                : [exercise.weights];
              const reps = Array.isArray(exercise.reps)
                ? exercise.reps
                : [exercise.reps];
              const sets = weights.map(
                (w, i) => `Set ${i + 1}: ${w} lbs x ${reps[i] ?? 0} reps`
              );
              return [`Volume: ${context.parsed.y}`, ...sets];
            },
          },
        },
      },
    };

    this.maxWeightChartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          min: minDate,
          max: maxDate,
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
            color: '#000000',
          },
          grid: {
            drawTicks: true,
            drawOnChartArea: false,
          },
          ticks: {
            color: '#000000',
            source: 'data',
            autoSkip: true,
            maxTicksLimit: 10,
            callback: function (value: any) {
              const date = new Date(value);
              return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Max Weight (lbs)',
            color: '#000000',
          },
          ticks: {
            color: '#000000',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#000000',
          },
        },
        title: {
          display: true,
          text: 'Best Set (Max Weight) Per Session',
          color: '#000000',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const idx = context.dataIndex;
              const exercise = this.exerciseProgress[idx];
              const weights = Array.isArray(exercise.weights)
                ? exercise.weights
                : [exercise.weights];
              const reps = Array.isArray(exercise.reps)
                ? exercise.reps
                : [exercise.reps];
              const maxWeight = Math.max(...weights, 0);
              const sets = [maxWeight].map(
                (w, i) => `Set ${i + 1}: ${w} lbs x ${reps[i] ?? 0} reps`
              );
              return [`Max Weight: ${maxWeight} lbs`, ...sets];
            },
          },
        },
      },
    };

    const maxWeightPerSession = this.exerciseProgress.map((exercise) => {
      const weights: number[] = Array.isArray(exercise.weights)
        ? exercise.weights
        : [exercise.weights];
      // Find the max weight for this session
      return Math.max(...weights, 0);
    });

    const maxWeightDataPoints = this.exerciseProgress.map((s, i) => ({
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
  }
}
