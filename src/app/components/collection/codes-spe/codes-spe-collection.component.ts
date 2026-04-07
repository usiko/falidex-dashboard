import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSpeStore } from '../../../stores/codes-spe/codes-spe.store';
import { IBaseCodeSpe } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-codes-spe-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './codes-spe-collection.component.html',
  styleUrl: './codes-spe-collection.component.scss'
})
export class CodesSpeCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseCodeSpe>();
  
  private codeSpeStore = inject(CodeSpeStore);
  protected codesSpe = this.codeSpeStore.entities;
  
  protected onSelect(codeSpe: IBaseCodeSpe): void {
    if (this.selectable()) {
      this.selection.emit(codeSpe);
    }
  }
}
