import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImporterPromptComponent } from '../smart/prompt/importer-prompt.component';
import { DiffTableComponent } from '../dumb/diff-table/diff-table.component';
import { DiffOption, DiffRow } from '../models/diff-row.model';

const MIN_PANEL_PERCENT = 20;
const MAX_PANEL_PERCENT = 80;
const DEFAULT_LEFT_PERCENT = 60;

@Component({
  selector: 'app-importer-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, ImporterPromptComponent, DiffTableComponent],
  templateUrl: './importer.page.html',
  styleUrl: './importer.page.scss'
})
export class ImporterPageComponent {
  protected readonly leftPanelPercent = signal(DEFAULT_LEFT_PERCENT);
  protected readonly isDragging = signal(false);

  // Alimentés par le smart "review" (QUE-70), pas encore implémenté : vide par défaut.
  protected readonly diffRows = signal<DiffRow[]>([]);
  protected readonly referentialOptions = signal<Partial<Record<string, DiffOption[]>>>({});

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
}
