import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { User } from '../profile/user.model';
import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit {
  user!: User;
  userProgress: any[] = [];

  exerciseProgress: {
    date: string;
    name: string;
    sets: number;
    reps: number[];
    weights: number[];
  }[] = [];

  chartType: ChartType = 'line';
  chartDataList: ChartConfiguration<'line'>['data'][] = [];
  // initializing chart options
  chartOptions: ChartConfiguration<'line'>['options'] = {};

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    // Subscribe to the current user from the Supabase service
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;

      if (this.user) {
        // Fetch user progress data here if needed
        this.workoutService.getWorkoutProgress(this.user.id);
        this.workoutService.progressListChanged.subscribe((progress) => {
          this.userProgress = progress;

          // Prepare data for the chart
          this.prepareChartData();
        });
      }
    });
  }

  prepareChartData() {
    this.userProgress.forEach((item) => {
      this.exerciseProgress.push({
        date: item.created_at,
        name: item.name,
        sets: item.sets,
        reps: item.reps,
        weights: item.weights,
      });
    });

    this.exerciseProgress.forEach((exercise) => {
      this.chartDataList.push({
        labels: [exercise.date],
        datasets: [
          {
            label: `${exercise.name} Weights`,
            data: exercise.weights,
            fill: false,
            borderColor: 'blue',
            tension: 0.1,
            yAxisID: 'y1',
          },
          {
            label: `${exercise.name} Reps`,
            data: exercise.reps,
            fill: false,
            borderColor: 'green',
            tension: 0.1,
            yAxisID: 'y2',
          },
        ],
      });
    });

    console.log('Exercise Progress:', this.exerciseProgress);
    // const weight = this.userProgress.map((item) => item.weights);
    // const reps = this.userProgress.map((item) => item.reps);

    // console.log('Chart Data:', { labels, weight, reps });

    // Create a multi axis line chart where there are two y axes: weight and reps. X axes is the date.
    // this.chartData = {
    //   labels: labels,
    //   datasets: [
    //     {
    //       label: 'Weights',
    //       data: weight[1],
    //       fill: false,
    //       borderColor: 'blue',
    //       tension: 0.1,
    //       yAxisID: 'y1',
    //     },
    //     {
    //       label: 'Reps',
    //       data: reps[1],
    //       fill: false,
    //       borderColor: 'green',
    //       tension: 0.1,
    //       yAxisID: 'y2',
    //     },
    //   ],
    // };

    this.chartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
          title: {
            display: true,
            text: 'Date',
          },
        },
        y1: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Weights (kg)',
          },
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Reps',
          },
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Workout Progress Over Time',
        },
      },
    };
  }
}
