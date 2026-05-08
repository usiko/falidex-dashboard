import { Component, inject, input, output, computed } from '@angular/core';
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
  protected codesSpe = computed(() => 
    this.codeSpeStore.entities().slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    )
  );
  
  protected onSelect(codeSpe: IBaseCodeSpe): void {
    if (this.selectable()) {
      this.selection.emit(codeSpe);
    }
  }
}
