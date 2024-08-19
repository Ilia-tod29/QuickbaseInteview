import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericButtonComponent } from './generic-button.component';
import { By } from '@angular/platform-browser';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('GenericButtonComponent', () => {
  let component: GenericButtonComponent;
  let fixture: ComponentFixture<GenericButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericButtonComponent],
      providers: [provideHttpClientTesting(),provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct label', () => {
    component.label = "Test Button";
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(buttonElement.textContent).toContain("Test Button");
  });

  it('should apply the correct classes', () => {
    component.btnClass = "btn-success";
    component.colorClass = "btn-danger";
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(buttonElement.classList).toContain("btn-success");
    expect(buttonElement.classList).toContain("btn-danger");
  });

  it('should emit clicked event when clicked', () => {
    spyOn(component.clicked, "emit");

    const buttonElement = fixture.debugElement.query(By.css("button")).nativeElement;
    buttonElement.click();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not have the color class when loading', () => {
    component.loading = true;
    component.colorClass = "btn-danger";
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(buttonElement.classList).not.toContain("btn-danger");
    expect(buttonElement.classList).toContain("btn-loading");
  });

  it('should have the color class when not loading', () => {
    component.loading = false;
    component.colorClass = "btn-danger";
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(buttonElement.classList).toContain("btn-danger");
    expect(buttonElement.classList).not.toContain("btn-loading");
  });
});
