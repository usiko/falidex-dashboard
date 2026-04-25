import { Component, ComponentRef, EventEmitter, inject, OnDestroy, Output, signal, Type, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface CollectionDialogData {
  title: string;
  collectionComponent: Type<any>;
}

@Component({
  selector: 'app-collection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './collection-dialog.component.html',
  styleUrl: './collection-dialog.component.scss'
})
export class CollectionDialogComponent<T> implements AfterViewInit, OnDestroy {
  data = inject<CollectionDialogData>(MAT_DIALOG_DATA);
  
  @ViewChild('collectionContainer', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  
  // Signal pour stocker l'item sélectionné
  selectedItem = signal<T | null>(null);
  
  // Output pour émettre la sélection
  @Output() itemSelected = new EventEmitter<T>();
  
  private componentRef?: ComponentRef<any>;

  ngAfterViewInit(): void {
    // Créer dynamiquement le composant de collection
    this.componentRef = this.containerRef.createComponent(this.data.collectionComponent);
    
    // Définir l'input selectable à true
    this.componentRef.setInput('selectable', true);
    
    // S'abonner à l'output selection
    if (this.componentRef.instance.selection) {
      this.componentRef.instance.selection.subscribe((item: T) => {
        this.onItemSelected(item);
      });
    }
  }

  onItemSelected(item: T): void {
    this.selectedItem.set(item);
    this.itemSelected.emit(item);
  }
  
  ngOnDestroy(): void {
    // Nettoyer le composant créé dynamiquement
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
