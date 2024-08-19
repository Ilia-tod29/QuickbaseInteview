import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldBuilderService } from '../services/field-builder.service';

@Component({
  selector: 'app-field-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  orderOprions: string[] = ["alphabetical"];
  highlightedChoices: string[] = [];
  labelError: string | null = null;
  choicesError: string | null = null;
  fieldBuilderService = inject(FieldBuilderService);

  localStorageKey = "formData";

  constructor() {}

  ngOnInit(): void {
    this.loadFormDataFromLocalStorage();
    if (this.choices !== "") {
      this.validateChoices();
    }
  }

  validateForm() {
    this.labelError = this.label ? null : "Label is required";
    
    this.saveFormDataToLocalStorage();
  }

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

  validateDefaultValue() {
    const choicesArray = this.splitChoices();
    const uniqueChoices = new Set(choicesArray);

    if (this.defaultValue.length === 0) {
      this.choices = this.splitString(this.choices, '\n')[1];
      this.defaultAutoAdded = false;
    } else if (!choicesArray.find(choice => choice === this.defaultValue)) {
      if (this.defaultAutoAdded) {
        this.choices = this.splitString(this.choices, '\n')[1];
      }
      this.choices = this.defaultValue + '\n' + this.choices;
      this.defaultAutoAdded = true;
    } else {
      this.choices = this.splitString(this.choices, '\n')[1];
      this.defaultAutoAdded = false;
    }

    this.saveFormDataToLocalStorage();
  }

  saveForm() {
    this.validateForm();
    this.validateChoices();

    if (this.labelError || this.choicesError) {
      return;
    }

    const choicesArray = this.splitChoices();

    // Just in case the logic above is not working
    if (this.defaultValue && !choicesArray.includes(this.defaultValue)) {
      console.error("Default value was not included in the choices");
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
        },
        error: (err: any) => {
          console.log(err);
        }
      });
  }

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

  loadFormDataFromLocalStorage() {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      this.label = formData.label || "";
      this.type = formData.type || "multi-select";
      this.isRequired = formData.isRequired || true;
      this.defaultValue = formData.defaultValue || "";
      this.choices = formData.choices ? formData.choices.join('\n') : "";
      this.order = formData.order || "alphabetical";
    }
  }

  clearForm() {
    this.label = "";
    this.type = "multi-select";
    this.isRequired = true;
    this.defaultValue = "";
    this.choices = "";
    this.order = "alphabetical";
    this.labelError = null;
    this.choicesError = null;

    localStorage.removeItem(this.localStorageKey);
  }

  capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  private splitChoices(): string[] {
    return this.choices.split('\n').map(choice => choice.trim()).filter(choice => choice);
  }

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