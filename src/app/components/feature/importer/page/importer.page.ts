import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ImporterBatchReviewed, ImporterPromptComponent } from '../smart/prompt/importer-prompt.component';
import { ImporterApplyService } from '../smart/prompt/importer-apply.service';
import { DiffEntry, ImporterBatchEditService } from '../smart/prompt/importer-batch-edit.service';
import { ImportApplyRequest } from '../smart/prompt/import-batch.model';
import { ImporterDraftContent } from '../smart/prompt/importer-draft.model';
import { ImporterDraftStorageService } from '../smart/prompt/importer-draft-storage.service';
import { DiffTableComponent } from '../dumb/diff-table/diff-table.component';
import {
  DiffFieldCorrection,
  DiffOption,
  DiffRowMatch,
  DiffRowTypeChange,
  ENTITY_TYPE_LABELS,
  RELATION_FIELD_JSON_KEYS
} from '../models/diff-row.model';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

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
  private readonly batchEditService = inject(ImporterBatchEditService);
  private readonly snackbar = inject(SnackbarService);
  private readonly draftStorage = inject(ImporterDraftStorageService);
  private readonly dialog = inject(MatDialog);

  protected readonly leftPanelPercent = signal(DEFAULT_LEFT_PERCENT);
  protected readonly isDragging = signal(false);

  // Alimentés par le smart "prompt" une fois le JSON de l'IA validé (bouton "Valider le JSON").
  // Chaque entrée garde ensemble la ligne affichée et l'opération du batch dont elle est issue.
  protected readonly entries = signal<DiffEntry[]>([]);
  protected readonly referentialOptions = signal<Partial<Record<string, DiffOption[]>>>({});
  protected readonly targetCode = signal<{ id: string; name: string; annee?: number } | null>(null);

  // Liés en bidirectionnel au smart "prompt" : conservés ici pour pouvoir persister/reprendre le brouillon.
  protected readonly pastedJson = signal('');
  protected readonly selectedCodeId = signal<string | null>(null);

  protected readonly importName = signal('');
  protected readonly newFicheName = signal('');
  protected readonly newFicheAnnee = signal<number | null>(null);
  protected readonly isApplying = signal(false);

  protected readonly diffRows = computed(() => this.entries().map((entry) => entry.row));
  protected readonly hasBatch = computed(() => this.entries().length > 0);
  protected readonly hasRelationRows = computed(() => this.diffRows().some((row) => row.entity === 'relation'));
  protected readonly needsNewFicheName = computed(() => this.hasRelationRows() && !this.targetCode());

  protected readonly canApplyImport = computed(() => {
    if (!this.hasBatch() || this.isApplying()) return false;
    if (this.diffRows().some((row) => row.incertain)) return false;
    if (!this.importName().trim()) return false;
    if (this.needsNewFicheName() && !this.newFicheName().trim()) return false;
    return true;
  });

  /** Notifié à chaque changement pertinent, avec un anti-rebond pour ne pas appeler le serveur à chaque frappe. */
  private readonly draftChanges = new Subject<ImporterDraftContent>();

  /**
   * Reprend le brouillon d'import laissé en cours par l'utilisateur (potentiellement depuis un
   * autre poste) avant de persister côté serveur ses futurs changements — c'est ce qui permet de
   * commencer un import sur un poste et de le terminer sur un autre.
   */
  constructor() {
    this.restoreDraft();

    this.draftChanges
      .pipe(
        debounceTime(600),
        switchMap((content) => (this.isContentEmpty(content) ? this.draftStorage.clear() : this.draftStorage.save(content))),
        takeUntilDestroyed()
      )
      .subscribe();

    effect(() => this.draftChanges.next(this.buildDraftContent()));
  }

  private buildDraftContent(): ImporterDraftContent {
    return {
      pastedJson: this.pastedJson(),
      selectedCodeId: this.selectedCodeId(),
      entries: this.entries(),
      referentialOptions: this.referentialOptions() as Partial<Record<string, DiffOption[]>>,
      targetCode: this.targetCode(),
      importName: this.importName(),
      newFicheName: this.newFicheName(),
      newFicheAnnee: this.newFicheAnnee()
    };
  }

  private restoreDraft(): void {
    this.draftStorage.load().subscribe((draft) => {
      if (!draft || this.isContentEmpty(draft.payload)) return;

      this.pastedJson.set(draft.payload.pastedJson);
      this.selectedCodeId.set(draft.payload.selectedCodeId);
      this.entries.set(draft.payload.entries);
      this.referentialOptions.set(draft.payload.referentialOptions);
      this.targetCode.set(draft.payload.targetCode);
      this.importName.set(draft.payload.importName);
      this.newFicheName.set(draft.payload.newFicheName);
      this.newFicheAnnee.set(draft.payload.newFicheAnnee);

      const savedAt = new Date(draft.savedAt);
      const savedAtLabel = Number.isNaN(savedAt.getTime()) ? '' : ` (sauvegardé le ${savedAt.toLocaleString('fr-FR')})`;
      this.snackbar.success(`Import en cours repris${savedAtLabel}`);
    });
  }

  private isContentEmpty(content: ImporterDraftContent): boolean {
    return !content.pastedJson.trim() && content.entries.length === 0 && !content.importName.trim();
  }

  protected onCancelImport(): void {
    if (!this.hasBatch() && !this.pastedJson().trim()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: "Annuler l'import",
        message: "Êtes-vous sûr de vouloir annuler cet import ? Le JSON collé et toutes les corrections effectuées seront perdus.",
        confirmText: 'Annuler l\'import',
        cancelText: 'Continuer l\'import'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.draftStorage.clear().subscribe();
      this.resetAfterApply();
      this.snackbar.success('Import annulé');
    });
  }

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
    this.entries.set(this.batchEditService.buildEntries(event.rows, event.batch.operations));
    this.referentialOptions.set(event.referentialOptions);
    this.targetCode.set(event.targetCode);
  }

  protected onFieldCorrected(correction: DiffFieldCorrection): void {
    const jsonKey = RELATION_FIELD_JSON_KEYS[correction.fieldKey];
    this.entries.update((entries) =>
      entries.map((entry) => {
        if (entry.row.id !== correction.rowId || !entry.row.relationFields) return entry;
        return {
          row: {
            ...entry.row,
            relationFields: entry.row.relationFields.map((field) =>
              field.key === correction.fieldKey ? { ...field, id: correction.newId, label: correction.newLabel } : field
            )
          },
          operation: { ...entry.operation, fields: { ...entry.operation.fields, [jsonKey]: correction.newId } }
        };
      })
    );
  }

  protected onIncertainResolved(rowId: string): void {
    this.entries.update((entries) =>
      entries.map((entry) =>
        entry.row.id === rowId
          ? { row: { ...entry.row, incertain: false }, operation: { ...entry.operation, incertain: false } }
          : entry
      )
    );
  }

  protected onRowDeleted(rowId: string): void {
    const entry = this.entries().find((candidate) => candidate.row.id === rowId);
    if (!entry) return;

    const { entries, affectedRelations } = this.batchEditService.removeEntry(this.entries(), rowId);
    this.entries.set(entries);
    this.dropReferentialOption(entry.row.entity, entry.row.sourceId);

    this.snackbar.success(
      affectedRelations
        ? `« ${entry.row.label} » retiré — ${affectedRelations} relation(s) à réaffecter`
        : `« ${entry.row.label} » retiré de l'import`
    );
  }

  protected onRowMatched(match: DiffRowMatch): void {
    const entry = this.entries().find((candidate) => candidate.row.id === match.rowId);
    if (!entry) return;

    const { entries, affectedRelations } = this.batchEditService.matchEntryToExisting(
      this.entries(),
      match.rowId,
      match.targetId,
      match.targetLabel
    );
    this.entries.set(entries);
    this.dropReferentialOption(entry.row.entity, entry.row.sourceId);

    this.snackbar.success(
      affectedRelations
        ? `« ${entry.row.label} » rattaché à « ${match.targetLabel} » — ${affectedRelations} relation(s) mise(s) à jour`
        : `« ${entry.row.label} » rattaché à « ${match.targetLabel} »`
    );
  }

  protected onRowTypeChanged(change: DiffRowTypeChange): void {
    const entry = this.entries().find((candidate) => candidate.row.id === change.rowId);
    if (!entry || entry.row.entity === change.entity) return;

    const { entries, affectedRelations } = this.batchEditService.changeEntryType(this.entries(), change.rowId, change.entity);
    this.entries.set(entries);
    this.moveReferentialOption(entry.row.entity, change.entity, entry.row.sourceId, entry.row.label);

    const typeLabel = ENTITY_TYPE_LABELS[change.entity];
    this.snackbar.success(
      affectedRelations
        ? `« ${entry.row.label} » est maintenant un ${typeLabel} — ${affectedRelations} relation(s) mise(s) à jour`
        : `« ${entry.row.label} » est maintenant un ${typeLabel}`
    );
  }

  /** L'entrée a changé de collection : son id temporaire doit être proposé dans les pickers du nouveau type. */
  private moveReferentialOption(fromEntity: string, toEntity: string, sourceId: string, label: string): void {
    this.referentialOptions.update((options) => ({
      ...options,
      [fromEntity]: (options[fromEntity] ?? []).filter((option) => option.id !== sourceId),
      [toEntity]: [...(options[toEntity] ?? []), { id: sourceId, name: label }]
    }));
  }

  /** L'entrée n'existe plus dans le batch : elle ne doit plus être proposée comme cible dans les pickers. */
  private dropReferentialOption(entity: string, sourceId: string): void {
    this.referentialOptions.update((options) => {
      const entityOptions = options[entity];
      if (!entityOptions) return options;
      return { ...options, [entity]: entityOptions.filter((option) => option.id !== sourceId) };
    });
  }

  protected onApplyImport(): void {
    if (!this.canApplyImport()) return;

    const request: ImportApplyRequest = {
      name: this.importName().trim(),
      operations: this.entries().map((entry) => entry.operation)
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
        this.draftStorage.clear().subscribe();
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
    this.entries.set([]);
    this.referentialOptions.set({});
    this.targetCode.set(null);
    this.importName.set('');
    this.newFicheName.set('');
    this.newFicheAnnee.set(null);
    this.pastedJson.set('');
    this.selectedCodeId.set(null);
  }
}
