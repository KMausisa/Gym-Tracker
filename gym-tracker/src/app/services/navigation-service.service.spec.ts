import { TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation-service.service';

describe('NavigationServiceService', () => {
  let service: NavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
