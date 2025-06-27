import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipWorkoutDialogComponent } from './skip-workout-dialog.component';

describe('SkipWorkoutDialogComponent', () => {
  let component: SkipWorkoutDialogComponent;
  let fixture: ComponentFixture<SkipWorkoutDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipWorkoutDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkipWorkoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
