import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-skip-workout-dialog',
  templateUrl: './skip-workout-dialog.component.html',
  styleUrls: ['./skip-workout-dialog.component.css'],
  imports: [
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
  ],
})
export class SkipWorkoutDialogComponent {
  reason: string = '';

  constructor(public dialogRef: MatDialogRef<SkipWorkoutDialogComponent>) {}

  submit() {
    this.dialogRef.close(this.reason); // Pass back the reason to the parent
  }
}
