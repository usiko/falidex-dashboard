import { Component, ComponentRef, EventEmitter, inject, OnDestroy, Output, signal, Type, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './collection-dialog.component.html',
  styleUrl: './collection-dialog.component.scss'
})
export class CollectionDialogComponent<T> implements AfterViewInit, OnDestroy {
  data = inject<CollectionDialogData>(MAT_DIALOG_DATA);
  
  @ViewChild('collectionContainer', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  
  // Signal pour stocker l'item sélectionné
  selectedItem = signal<T | null>(null);
  
  // Signal pour le terme de recherche
  searchTerm = signal<string>('');
  
  // Output pour émettre la sélection
  @Output() itemSelected = new EventEmitter<T>();
  
  private componentRef?: ComponentRef<any>;

  ngAfterViewInit(): void {
    // Créer dynamiquement le composant de collection
    this.componentRef = this.containerRef.createComponent(this.data.collectionComponent);
    
    // Définir l'input selectable à true
    this.componentRef.setInput('selectable', true);
    this.componentRef.setInput('searchTerm', this.searchTerm());
    
    // S'abonner à l'output selection
    if (this.componentRef.instance.selection) {
      this.componentRef.instance.selection.subscribe((item: T) => {
        this.onItemSelected(item);
      });
    }
  }
  
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    // Mettre à jour l'input searchTerm du composant de collection
    if (this.componentRef) {
      this.componentRef.setInput('searchTerm', term);
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
