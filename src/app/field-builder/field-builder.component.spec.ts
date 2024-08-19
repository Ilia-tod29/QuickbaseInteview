import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FieldBuilderComponent } from './field-builder.component';
import { FormsModule } from '@angular/forms';
import { GenericButtonComponent } from '../generic-button/generic-button.component';
import { FieldBuilderService } from '../services/field-builder.service';
import { By } from '@angular/platform-browser';

describe('FieldBuilderComponent', () => {
  let component: FieldBuilderComponent;
  let fixture: ComponentFixture<FieldBuilderComponent>;
  let fieldBuilderService: FieldBuilderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldBuilderComponent, FormsModule, GenericButtonComponent],
      providers: [FieldBuilderService, provideHttpClientTesting(),provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldBuilderComponent);
    component = fixture.componentInstance;
    fieldBuilderService = TestBed.inject(FieldBuilderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate label and set labelError', () => {
    component.label = "";
    component.validateLabel();
    expect(component.labelError).toBe("Label is required");
  
    component.label = "Valid Label";
    component.validateLabel();
    expect(component.labelError).toBeNull();
  });

  it('should validate choices and set choicesError', () => {
    component.choices = "Choice 1\nChoice 2\nChoice 2";
    component.validateChoices();
    expect(component.choicesError).toBe("Duplicate choices are not allowed");

    component.choices = `1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n
                        11\n12\n13\n14\n15\n16\n17\n18\n19\n20\n
                        21\n22\n23\n24\n25\n26\n27\n28\n29\n30\n
                        31\n32\n33\n34\n35\n36\n37\n37\n39\n40\n
                        41\n42\n43\n44\n45\n46\n47\n48\n49\n50\n51`;
    component.validateChoices();
    expect(component.choicesError).toBe("Cannot have more than 50 choices");

    component.choices = "";
    component.validateChoices();
    expect(component.choicesError).toBe("At least one choice must be filled");

    component.choices = `a really loooooooooooooooooooooooong choice\n
                        another really looooooooooooooooooong choice`;
    component.validateChoices();
    expect(component.choicesError).toBe("Single choice maximum length: 40. You have 2 longer choice/s.");

    component.choices = `a really loooooooooooooooooooooooong choice\n
                        another really looooooooooooooooooong choice\n
                        duplicate\n
                        duplicate`;
    component.validateChoices();
    expect(component.choicesError).toBe("Duplicate choices are not allowed");
    
    component.choices = "Choice 1\nChoice 2\nChoice 3";
    component.validateChoices();
    expect(component.choicesError).toBeNull();
  });

  it('should validate default value by verifying it exists within the choices', () => {
    component.choices = "Choice 1\nChoice 2\nChoice 3";
    component.defaultValue = "Choice 4";
    component.validateDefaultValue();
  
    expect(component.choices).toBe("Choice 4\nChoice 1\nChoice 2\nChoice 3");

    component.defaultValue = "Choice 3";
    component.validateDefaultValue();
    expect(component.choices).toBe("Choice 1\nChoice 2\nChoice 3");
  });

  it('should call saveForm when save button is clicked', () => {
    spyOn(component, "saveForm");
    const saveButton = fixture.debugElement.query(By.css("#save-changes"));
    saveButton.triggerEventHandler("clicked", null);
    expect(component.saveForm).toHaveBeenCalled();
  });
  
  it('should call clearForm when cancel button is clicked', () => {
    spyOn(component, "clearForm");
    const cancelButton = fixture.debugElement.query(By.css("#clear"));
    cancelButton.triggerEventHandler("clicked", null);
    expect(component.clearForm).toHaveBeenCalled();
  });

  it('should save form data to local storage', () => {
    const localStorageSpy = spyOn(localStorage, "setItem");
    component.label = "Test Label";
    component.choices = "Choice 1\nChoice 2\nChoice 3";
    component.defaultValue = "Choice 2";
    component.saveFormDataToLocalStorage();
    
    const expectedData = JSON.stringify({
      label: "Test Label",
      type: "multi-select",
      isRequired: true,
      defaultValue: "Choice 2",
      choices: ["Choice 1", "Choice 2", "Choice 3"],
      order: "alphabetical"
    });
  
    expect(localStorageSpy).toHaveBeenCalledWith(component.localStorageKey, expectedData);
  });
  
  it('should load form data from local storage', () => {
    const savedData = {
      label: "Loaded Label",
      type: "multi-select",
      isRequired: true,
      defaultValue: "Choice 2",
      choices: ["Loaded Choice 1", "Loaded Choice 2"],
      order: "alphabetical"
    };
    
    spyOn(localStorage, "getItem").and.returnValue(JSON.stringify(savedData));
    component.loadFormDataFromLocalStorage();
  
    expect(component.label).toBe("Loaded Label");
    expect(component.choices).toBe("Loaded Choice 1\nLoaded Choice 2");
    expect(component.type).toBe("multi-select");
    expect(component.isRequired).toBeTrue();
    expect(component.order).toBe("alphabetical");
    expect(component.defaultValue).toBe("Choice 2");
  });
  
});
