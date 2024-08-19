import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FieldBuilderService } from './field-builder.service';

describe('FieldBuilderService', () => {
  let service: FieldBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(),provideHttpClient()]
    });
    service = TestBed.inject(FieldBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
