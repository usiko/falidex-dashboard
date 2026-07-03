import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';
import { SnackbarService } from '../../../../../services/snackbar/snackbar.service';
import { buildImportPrompt } from './importer-prompt.builder';

@Component({
  selector: 'app-importer-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './importer-prompt.component.html',
  styleUrl: './importer-prompt.component.scss'
})
export class ImporterPromptComponent {
  private readonly relationStore = inject(RelationDataStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly colorStore = inject(ColorStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly positionStore = inject(PositionStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly snackbar = inject(SnackbarService);

  protected readonly codes = computed(() =>
    [...this.relationStore.entities()].sort((a, b) => a.name.localeCompare(b.name) || b.annee - a.annee)
  );

  protected readonly selectedCodeId = signal<string | null>(null);

  protected readonly selectedCode = computed(() => {
    const id = this.selectedCodeId();
    return id ? this.relationStore.entityMap()[id] ?? null : null;
  });

  protected readonly prompt = computed(() =>
    buildImportPrompt({
      refs: {
        colors: this.colorStore.entities(),
        filieres: this.filiereStore.entities(),
        symbols: this.symbolStore.entities(),
        placements: this.placementStore.entities(),
        positions: this.positionStore.entities(),
        significations: this.significationStore.entities()
      },
      selectedCode: this.selectedCode(),
      lookups: {
        filiereMap: this.filiereStore.entityMap(),
        symboleMap: this.symbolStore.entityMap(),
        placementMap: this.placementStore.entityMap(),
        positionMap: this.positionStore.entityMap(),
        circulaireMap: this.circulaireStore.entityMap(),
        significationMap: this.significationStore.entityMap(),
        symboleSensMap: this.symbolSensStore.entityMap(),
        symboleAccessoryMap: this.symbolAccessoryStore.entityMap()
      }
    })
  );

  protected readonly promptLength = computed(() => this.prompt().length);

  protected readonly pastedJson = signal('');

  protected onCodeChange(codeId: string | null): void {
    this.selectedCodeId.set(codeId);
  }

  protected async onCopyPrompt(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.prompt());
      this.snackbar.success('Prompt copié dans le presse-papiers');
    } catch {
      this.snackbar.error('Impossible de copier le prompt');
    }
  }
}
