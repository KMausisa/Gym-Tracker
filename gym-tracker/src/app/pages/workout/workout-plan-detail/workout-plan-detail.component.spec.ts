import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanDetailComponent } from './workout-plan-detail.component';

describe('WorkoutPlanDetailComponent', () => {
  let component: WorkoutPlanDetailComponent;
  let fixture: ComponentFixture<WorkoutPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
