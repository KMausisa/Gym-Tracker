import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { HomeComponent } from '../pages/home/home.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class CanExitWorkoutGuard implements CanDeactivate<HomeComponent> {
  constructor(private dialog: MatDialog) {}

  /**
   * CanDeactivate method to check if the user can exit the workout
   * @param component - HomeComponent instance
   * @returns {Observable<boolean> | boolean} An observable that resolves to true if the user can exit, or false if they cannot
   */
  canDeactivate(component: HomeComponent): Observable<boolean> | boolean {
    if (component.inWorkout) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          message:
            'You have an active workout. Are you sure you want to leave?',
        },
      });
      return dialogRef.afterClosed().pipe(
        switchMap((result) => {
          if (result) {
            component.resetWorkoutProgress();
            return of(true);
          }
          return of(false);
        })
      );
    }
    return true;
  }
}
