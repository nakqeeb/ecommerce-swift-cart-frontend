import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespace(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // check if string only contains whitespace
        if ((control.value != null) && (control.value.trim().length === 0)) {

            // invalid, return error object
            return { 'noWhitespace': true };
        }
        else {
            // valid, return null
            return null;
        }
  };
}
