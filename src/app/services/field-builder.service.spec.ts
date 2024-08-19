import { TestBed } from '@angular/core/testing';

import { FieldBuilderService } from './field-builder.service';

describe('FieldBuilderService', () => {
  let service: FieldBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
