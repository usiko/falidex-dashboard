import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import {
  DiffFieldCorrection,
  DiffOption,
  DiffRelationField,
  DiffRow,
  ENTITY_TYPE_LABELS
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

  protected readonly isReferential = computed(() => this.row().entity !== 'relation');
  protected readonly entityLabel = computed(() => ENTITY_TYPE_LABELS[this.row().entity]);
  protected readonly confidencePercent = computed(() => Math.round(this.row().confidence));
  protected readonly confidenceColor = computed(() => {
    const hue = Math.max(0, Math.min(100, this.confidencePercent())) * 1.2; // 0 = rouge, 120 = vert
    return `hsl(${hue}, 70%, 42%)`;
  });

  protected onFieldClick(field: DiffRelationField): void {
    const options = this.referentialOptions()[field.entityType] ?? [];
    const dialogRef = this.dialog.open<EntityPickerDialogComponent, EntityPickerDialogData, DiffOption>(EntityPickerDialogComponent, {
      width: '400px',
      data: {
        title: `Sélectionner : ${ENTITY_TYPE_LABELS[field.entityType]}`,
        options,
        currentId: field.id
      }
    });

    dialogRef.afterClosed().subscribe((selected) => {
      if (!selected) return;
      this.fieldCorrected.emit({
        rowId: this.row().id,
        fieldKey: field.key,
        newId: selected.id,
        newLabel: selected.name
      });
    });
  }
}
