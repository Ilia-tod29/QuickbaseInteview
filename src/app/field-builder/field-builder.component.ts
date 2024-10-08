import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldBuilderService } from '../services/field-builder.service';
import { GenericButtonComponent } from '../generic-button/generic-button.component';

@Component({
  selector: 'app-field-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericButtonComponent],
  templateUrl: './field-builder.component.html',
  styleUrl: './field-builder.component.scss'
})
export class FieldBuilderComponent implements OnInit {
  defaultAutoAdded: boolean = false;
  label: string = "";
  isRequired: boolean = true;
  defaultValue: string = "";
  choices: string = "";
  type: string = "multi-select";
  typeOptions: string[] = ["multi-select"];
  order: string = "alphabetical";
  orderOptions: string[] = ["alphabetical"];
  highlightedChoices: string[] = [];
  labelError: string | null = null;
  choicesError: string | null = null;
  fieldBuilderService = inject(FieldBuilderService);
  cancelBtnLoading: boolean = false;
  saveBtnLoading: boolean = false;

  localStorageKey = "formData";

  constructor() {}

  ngOnInit(): void {
    this.loadFormDataFromLocalStorage();
    if (this.choices !== "") {
      this.validateChoices();
    }
  }

  // Validates the label
  validateLabel() {
    this.labelError = this.label ? null : "Label is required";
    
    this.saveFormDataToLocalStorage();
  }

  // Performs the whole validation on the choices
  validateChoices() {
    const choicesArray = this.splitChoices();
    const uniqueChoices = new Set(choicesArray);
    this.highlightedChoices = choicesArray.filter((choice: string) => {
      return choice.length > 40;
    });

    if (choicesArray.length > 50) {
      this.choicesError = "Cannot have more than 50 choices";
    } else if (uniqueChoices.size !== choicesArray.length) {
      this.choicesError = "Duplicate choices are not allowed";
    } else if (uniqueChoices.size === 0) {
      this.choicesError = "At least one choice must be filled";
    } else if (this.highlightedChoices.length > 0) {
      this.choicesError = `Single choice maximum length: 40. You have ${this.highlightedChoices.length} longer choice/s.`;
    } else {
      this.choicesError = null;
    }

    this.saveFormDataToLocalStorage();
  }

  // Updates the choices based on the default value. The rule is that the default value must exist within the choices
  validateDefaultValue() {
    const choicesArray = this.splitChoices();
    const uniqueChoices = new Set(choicesArray);

    if (this.defaultValue.length === 0 && this.defaultAutoAdded) {
      // Removed last symbol from the default value field
      this.choices = this.splitString(this.choices, '\n')[1];
      this.defaultAutoAdded = false;
    } else if (!choicesArray.find(choice => choice === this.defaultValue)) {
      // No match found
      if (this.defaultAutoAdded) {
        this.choices = this.splitString(this.choices, '\n')[1];
      }
      this.choices = this.defaultValue + '\n' + this.choices;
      this.defaultAutoAdded = true;
    } else {
      // A match is found - we should remove the auto added default
      if (this.defaultAutoAdded) {
        this.choices = this.splitString(this.choices, '\n')[1];
      }
      this.defaultAutoAdded = false;
    }

    this.saveFormDataToLocalStorage();
  }

  // Performs all validations before calling the service (calling the API)
  saveForm() {
    this.saveBtnLoading = true;
    this.validateLabel();
    this.validateChoices();

    if (this.labelError || this.choicesError) {
      this.saveBtnLoading = false;
      return;
    }

    const choicesArray = this.splitChoices();

    // Just in case the logic above is not working
    if (this.defaultValue && !choicesArray.includes(this.defaultValue)) {
      console.warn("Default value was not included in the choices");
      console.info("Adding the default value to the choices.");
      choicesArray.push(this.defaultValue);
      this.choices = this.defaultValue + '\n' + this.choices;
    }

    this.saveFormDataToLocalStorage();

    const formData = {
      label: this.label,
      type: this.type,
      isRequired: this.isRequired,
      defaultValue: this.defaultValue,
      choices: choicesArray,
      order: this.order
    };

    this.fieldBuilderService.createForm(formData)
      .subscribe({
        next: (data: any) => {
          console.log("Response: ");
          console.log(data);
          console.log("Data sent: ");
          console.log(formData)
          this.saveBtnLoading = false;
        },
        error: (err: any) => {
          console.log(err);
          this.saveBtnLoading = false;
        }
      });

  }

  // Saves the form data to the local storage
  saveFormDataToLocalStorage() {
    const choicesArray = this.splitChoices();
    const formData = {
      label: this.label,
      type: this.type,
      isRequired: this.isRequired,
      defaultValue: this.defaultValue,
      choices: choicesArray,
      order: this.order
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(formData));
  }

  // Reads the data from the local storage (if such exists) and updates the the form with last updated data.
  loadFormDataFromLocalStorage() {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      this.label = formData.label || "";
      this.type = formData.type || "multi-select";
      this.isRequired = formData.isRequired;
      this.defaultValue = formData.defaultValue || "";
      this.choices = formData.choices ? formData.choices.join('\n') : "";
      this.order = formData.order || "alphabetical";
    }
  }

  // Sets the form in a starting position
  clearForm() {
    this.cancelBtnLoading = true;
    this.label = "";
    this.type = "multi-select";
    this.isRequired = true;
    this.defaultValue = "";
    this.choices = "";
    this.order = "alphabetical";
    this.labelError = null;
    this.choicesError = null;

    localStorage.removeItem(this.localStorageKey);
    this.cancelBtnLoading = false;
  }

  // Capitalizes the first letter of a string. e.g. capitalizeFirstLetter("hello") -> "Hello"
  capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  // Generates an array of the provided choices. e.g. this.choices = "1\n2\n3", splitChoices() -> ["1", "2", "3"]
  private splitChoices(): string[] {
    return this.choices.split('\n').map(choice => choice.trim()).filter(choice => choice);
  }

  // Splits a string on two parts by a delimiter. e.g. splitString("Hello, my name is, John", ",") -> ["Hello,", " my name is, John"]
  private splitString(input: string, delimiter: string): [string, string] {
    const index = input.indexOf(delimiter);
    if (index === -1) {
        return [input, ""];
    }

    const firstPart = input.substring(0, index+1).trim();
    const secondPart = input.substring(index + delimiter.length).trim();

    return [firstPart, secondPart];
  }
}