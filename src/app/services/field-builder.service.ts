import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfig } from '../config/api-config';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FieldBuilderService {

  constructor() { }

  http = inject(HttpClient)

  createForm(data: any) {
    return this.http.post(ApiConfig.FORM_GENERATOR_ENDPOINT, data).pipe(catchError(this.handleError))
  }

  private handleError(error: any) {
    console.log(error);
    return throwError(() => new Error("Something went wrong: " + error))
  }
}
