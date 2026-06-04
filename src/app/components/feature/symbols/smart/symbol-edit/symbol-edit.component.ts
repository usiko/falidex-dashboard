import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { DataService } from '../../../../../services/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageCarouselDialogComponent } from '../../dialogs/image-carousel-dialog/image-carousel-dialog.component';
import { SymbolAddImgDialogComponent, SymbolAddImgDialogData } from '../../dialogs/symbol-add-img-dialog/symbol-add-img-dialog.component';
import { BlobImagePipe } from '../../../../pipe/img-url.pipe';

@Component({
  selector: 'app-symbol-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    BlobImagePipe
  ],
  templateUrl: './symbol-edit.component.html',
  styleUrl: './symbol-edit.component.scss'
})
export class SymbolEditComponent {
  id = input<string | undefined>();

  private readonly symbolStore = inject(SymbolStore);
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly symbol = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.symbolStore.getById(id)();
  });

  protected readonly nameValue = signal<string>('');
  protected readonly occurenceMessage = signal<string | undefined>(undefined);
  protected readonly loading = signal(false);


  constructor() {
    effect(() => {
      const sym = this.symbol();
      if (sym?.name) {
        this.nameValue.set(sym.name);
      }
    });

    effect(() => {
      const id = this.id();
      if (!id) return;
      this.loading.set(true);
      this.dataService.getOccurenceRelationSymbole(id).subscribe(occurences => {
        const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
        const totalRelations = occurences.length;
        this.occurenceMessage.set(
          totalOccurences > 0
            ? `Cet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)`
            : undefined
        );
        this.loading.set(false);
      });
    });
  }

  openImageCarousel(index: number) {
    const symbol = this.symbol();
    if (!symbol?.imgs) return;

    this.dialog.open(ImageCarouselDialogComponent, {
      data: {
        images: symbol.imgs,
        initialIndex: index,
        symbolName: symbol.name
      },
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'image-carousel-dialog'
    });
  }

  openAddImageDialog() {
    const id = this.id();
    if (!id) return;
    const dialogData: SymbolAddImgDialogData = { symbolId: id };
    this.dialog.open(SymbolAddImgDialogComponent, {
      data: dialogData,
      width: '420px'
    }).afterClosed().subscribe((newImgs: {
      id: string;
      url: string;
      modificationDate: Date;
    }[]) => {
      if (newImgs) {
        const symbol = this.symbol();
        const currentImgs = symbol?.imgs ?? [];
        // Replace imgs with same id, otherwise keep existing
        const newImgsMap = new Map(newImgs.map(img => [img.id, img]));
        const mergedImgs = [
          ...currentImgs.filter(img => !newImgsMap.has(img.id)),
          ...newImgs
        ];
        this.symbolStore.update(id, { imgs: mergedImgs });
      }
    });
  }

  onDeleteImg(imgId: string) {
    const id = this.id();
    const symbol = this.symbol();
    if (!id || !symbol) return;
    const updatedImgs = (symbol.imgs ?? []).filter(img => img.id !== imgId);
    this.symbolStore.update(id, { imgs: updatedImgs });
  }

  onSave() {
    const id = this.id();
    const name = this.nameValue().trim();
    if (!id || !name) return;
    this.symbolStore.update(id, { name });
    this.router.navigate(['/symbole', id]);
  }

  onCancel() {
    const id = this.id();
    if (id) {
      this.router.navigate(['/symbole', id]);
    } else {
      this.router.navigate(['/symbols']);
    }
  }
}
