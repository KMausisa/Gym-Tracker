import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseProgressComponent } from './progress-exercise.component';

describe('ExerciseProgressComponent', () => {
  let component: ExerciseProgressComponent;
  let fixture: ComponentFixture<ExerciseProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
