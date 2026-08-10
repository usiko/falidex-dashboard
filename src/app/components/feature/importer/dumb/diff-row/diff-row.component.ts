import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import {
  DiffFieldCorrection,
  DiffOption,
  DiffReferentialEntityType,
  DiffRelationField,
  DiffRow,
  DiffRowMatch,
  DiffRowTypeChange,
  ENTITY_TYPE_LABELS,
  REFERENTIAL_ENTITY_TYPES
} from '../../models/diff-row.model';
import { EntityPickerDialogComponent, EntityPickerDialogData } from '../entity-picker-dialog/entity-picker-dialog.component';

@Component({
  selector: 'app-diff-row',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './diff-row.component.html',
  styleUrl: './diff-row.component.scss'
})
export class DiffRowComponent {
  private readonly dialog = inject(MatDialog);

  row = input.required<DiffRow>();
  referentialOptions = input<Partial<Record<string, DiffOption[]>>>({});

  fieldCorrected = output<DiffFieldCorrection>();
  incertainResolved = output<string>();
  rowDeleted = output<string>();
  rowMatched = output<DiffRowMatch>();
  rowTypeChanged = output<DiffRowTypeChange>();

  protected readonly isReferential = computed(() => this.row().entity !== 'relation');
  /** Rattacher à un item existant n'a de sens que pour un ajout de collection (un `tmp:` id à remplacer). */
  protected readonly canMatchExisting = computed(() => this.row().op === 'add' && this.isReferential());
  protected readonly entityLabel = computed(() => ENTITY_TYPE_LABELS[this.row().entity]);
  protected readonly confidencePercent = computed(() => Math.round(this.row().confidence));
  protected readonly confidenceColor = computed(() => {
    const hue = Math.max(0, Math.min(100, this.confidencePercent())) * 1.2; // 0 = rouge, 120 = vert
    return `hsl(${hue}, 70%, 42%)`;
  });

  protected onFieldClick(field: DiffRelationField): void {
    // Option de tête factice (id vide) : sélectionnable pour retirer la liaison, distincte de tout id réel.
    const clearOption: DiffOption = { id: '', name: 'Non défini' };
    const options = [clearOption, ...(this.referentialOptions()[field.entityType] ?? [])];
    const dialogRef = this.dialog.open<EntityPickerDialogComponent, EntityPickerDialogData, DiffOption>(EntityPickerDialogComponent, {
      width: '400px',
      data: {
        title: `Sélectionner : ${ENTITY_TYPE_LABELS[field.entityType]}`,
        options,
        currentId: field.id ?? ''
      }
    });

    dialogRef.afterClosed().subscribe((selected) => {
      if (!selected) return;
      this.fieldCorrected.emit({
        rowId: this.row().id,
        fieldKey: field.key,
        newId: selected.id || null,
        newLabel: selected.id ? selected.name : ''
      });
    });
  }

  protected onResolveIncertain(): void {
    this.incertainResolved.emit(this.row().id);
  }

  protected onDelete(): void {
    this.rowDeleted.emit(this.row().id);
  }

  protected onMatchExisting(): void {
    const row = this.row();
    // On ne se propose pas soi-même comme cible du rattachement.
    const options = (this.referentialOptions()[row.entity] ?? []).filter((option) => option.id !== row.sourceId);
    const dialogRef = this.dialog.open<EntityPickerDialogComponent, EntityPickerDialogData, DiffOption>(EntityPickerDialogComponent, {
      width: '400px',
      data: {
        title: `Rattacher « ${row.label} » à un ${ENTITY_TYPE_LABELS[row.entity]} existant`,
        options,
        currentId: null
      }
    });

    dialogRef.afterClosed().subscribe((selected) => {
      if (!selected) return;
      this.rowMatched.emit({ rowId: row.id, targetId: selected.id, targetLabel: selected.name });
    });
  }

  protected onChangeType(): void {
    const row = this.row();
    // Le picker sert ici à choisir un type d'entité : l'`id` de l'option est le type lui-même.
    // Le type courant reste dans la liste (coché) pour qu'on voie d'où on part.
    const options: DiffOption[] = REFERENTIAL_ENTITY_TYPES.map((entity) => ({
      id: entity,
      name: ENTITY_TYPE_LABELS[entity]
    }));

    const dialogRef = this.dialog.open<EntityPickerDialogComponent, EntityPickerDialogData, DiffOption>(EntityPickerDialogComponent, {
      width: '400px',
      data: {
        title: `Changer le type de « ${row.label} »`,
        options,
        currentId: row.entity
      }
    });

    dialogRef.afterClosed().subscribe((selected) => {
      if (!selected) return;
      this.rowTypeChanged.emit({ rowId: row.id, entity: selected.id as DiffReferentialEntityType });
    });
  }
}
