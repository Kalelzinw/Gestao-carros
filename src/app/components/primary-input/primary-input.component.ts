import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

export type InputTypes = 'text' | 'email' | 'password' | 'date' | 'tel';

@Component({
  selector: 'app-primary-input',
  standalone: true,
  templateUrl: './primary-input.component.html',
  styleUrls: ['./primary-input.component.scss'],
  imports: [
    NgxMaskDirective // ✅ Diretiva necessária para usar [mask]
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PrimaryInputComponent),
      multi: true
    },
    provideNgxMask() // ✅ Necessário para habilitar a máscara no standalone
  ]
})
export class PrimaryInputComponent implements ControlValueAccessor {
  @Input() type: InputTypes = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() inputName: string = '';
  @Input() mask: string = '';
   customPatterns = { '0': { pattern: /\d/ } };

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // optional: lógica para desabilitar input
  }
}
