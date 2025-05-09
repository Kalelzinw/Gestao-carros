import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfOnlyNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return value && !/^\d+$/.test(value) ? { cpfOnlyNumbers: true } : null;
  };
}