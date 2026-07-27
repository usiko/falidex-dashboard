import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImporterBatchReviewed, ImporterPromptComponent } from '../smart/prompt/importer-prompt.component';
import { ImporterApplyService } from '../smart/prompt/importer-apply.service';
import { ImportApplyRequest, ImportBatch } from '../smart/prompt/import-batch.model';
import { DiffTableComponent } from '../dumb/diff-table/diff-table.component';
import { DiffFieldCorrection, DiffOption, DiffRow, RELATION_FIELD_JSON_KEYS } from '../models/diff-row.model';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';

const MIN_PANEL_PERCENT = 20;
const MAX_PANEL_PERCENT = 80;
const DEFAULT_LEFT_PERCENT = 60;

@Component({
  selector: 'app-importer-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ImporterPromptComponent,
    DiffTableComponent
  ],
  templateUrl: './importer.page.html',
  styleUrl: './importer.page.scss'
})
export class ImporterPageComponent {
  private readonly importerApplyService = inject(ImporterApplyService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly leftPanelPercent = signal(DEFAULT_LEFT_PERCENT);
  protected readonly isDragging = signal(false);

  // Alimentés par le smart "prompt" une fois le JSON de l'IA validé (bouton "Valider le JSON").
  protected readonly batch = signal<ImportBatch | null>(null);
  protected readonly diffRows = signal<DiffRow[]>([]);
  protected readonly referentialOptions = signal<Partial<Record<string, DiffOption[]>>>({});
  protected readonly targetCode = signal<{ id: string; name: string; annee?: number } | null>(null);

  protected readonly importName = signal('');
  protected readonly newFicheName = signal('');
  protected readonly newFicheAnnee = signal<number | null>(null);
  protected readonly isApplying = signal(false);

  protected readonly hasRelationRows = computed(() => this.diffRows().some((row) => row.entity === 'relation'));
  protected readonly needsNewFicheName = computed(() => this.hasRelationRows() && !this.targetCode());

  protected readonly canApplyImport = computed(() => {
    if (!this.batch() || this.diffRows().length === 0 || this.isApplying()) return false;
    if (this.diffRows().some((row) => row.incertain)) return false;
    if (!this.importName().trim()) return false;
    if (this.needsNewFicheName() && !this.newFicheName().trim()) return false;
    return true;
  });

  private dragStartX = 0;
  private dragStartPercent = DEFAULT_LEFT_PERCENT;
  private containerWidth = 0;

  protected onDividerPointerDown(event: PointerEvent, container: HTMLElement): void {
    event.preventDefault();
    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartPercent = this.leftPanelPercent();
    this.containerWidth = container.getBoundingClientRect().width;

    const onPointerMove = (moveEvent: PointerEvent) => this.onDividerPointerMove(moveEvent);
    const onPointerUp = () => {
      this.isDragging.set(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  private onDividerPointerMove(event: PointerEvent): void {
    if (!this.containerWidth) return;
    const deltaPercent = ((event.clientX - this.dragStartX) / this.containerWidth) * 100;
    const nextPercent = this.dragStartPercent + deltaPercent;
    const clampedPercent = Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, nextPercent));
    this.leftPanelPercent.set(clampedPercent);
  }

  protected onDividerKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === 'ArrowLeft') {
      this.leftPanelPercent.set(Math.max(MIN_PANEL_PERCENT, this.leftPanelPercent() - step));
    } else if (event.key === 'ArrowRight') {
      this.leftPanelPercent.set(Math.min(MAX_PANEL_PERCENT, this.leftPanelPercent() + step));
    } else {
      return;
    }
    event.preventDefault();
  }

  protected onDividerDoubleClick(): void {
    this.leftPanelPercent.set(DEFAULT_LEFT_PERCENT);
  }

  protected onReviewed(event: ImporterBatchReviewed): void {
    this.batch.set(event.batch);
    this.diffRows.set(event.rows);
    this.referentialOptions.set(event.referentialOptions);
    this.targetCode.set(event.targetCode);
  }

  protected onFieldCorrected(correction: DiffFieldCorrection): void {
    this.diffRows.update((rows) =>
      rows.map((row) => {
        if (row.id !== correction.rowId || !row.relationFields) return row;
        return {
          ...row,
          relationFields: row.relationFields.map((field) =>
            field.key === correction.fieldKey ? { ...field, id: correction.newId, label: correction.newLabel } : field
          )
        };
      })
    );

    const index = this.parseRowIndex(correction.rowId);
    if (index === null) return;
    const jsonKey = RELATION_FIELD_JSON_KEYS[correction.fieldKey];
    this.batch.update((current) => {
      if (!current) return current;
      const operations = current.operations.map((op, i) =>
        i === index ? { ...op, fields: { ...op.fields, [jsonKey]: correction.newId } } : op
      );
      return { ...current, operations };
    });
  }

  protected onIncertainResolved(rowId: string): void {
    this.diffRows.update((rows) => rows.map((row) => (row.id === rowId ? { ...row, incertain: false } : row)));

    const index = this.parseRowIndex(rowId);
    if (index === null) return;
    this.batch.update((current) => {
      if (!current) return current;
      const operations = current.operations.map((op, i) => (i === index ? { ...op, incertain: false } : op));
      return { ...current, operations };
    });
  }

  protected onApplyImport(): void {
    const currentBatch = this.batch();
    if (!currentBatch || !this.canApplyImport()) return;

    const request: ImportApplyRequest = {
      name: this.importName().trim(),
      operations: currentBatch.operations
    };

    const code = this.targetCode();
    if (code) {
      request.linkId = code.id;
    } else if (this.hasRelationRows()) {
      const annee = this.newFicheAnnee();
      request.newLink = {
        name: this.newFicheName().trim(),
        ...(annee ? { annee } : {})
      };
    }

    this.isApplying.set(true);
    this.importerApplyService.apply(request).subscribe({
      next: () => {
        this.isApplying.set(false);
        this.snackbar.success("Import appliqué avec succès");
        this.resetAfterApply();
      },
      error: (err: HttpErrorResponse) => {
        this.isApplying.set(false);
        const message = (err.error?.error as string | undefined) ?? "Erreur lors de l'application de l'import";
        this.snackbar.error(message);
      }
    });
  }

  private resetAfterApply(): void {
    this.batch.set(null);
    this.diffRows.set([]);
    this.referentialOptions.set({});
    this.targetCode.set(null);
    this.importName.set('');
    this.newFicheName.set('');
    this.newFicheAnnee.set(null);
  }

  private parseRowIndex(rowId: string): number | null {
    const [indexPart] = rowId.split(':');
    const index = Number(indexPart);
    return Number.isInteger(index) ? index : null;
  }
}
