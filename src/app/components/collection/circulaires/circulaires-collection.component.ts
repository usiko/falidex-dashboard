import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CirculaireStore } from '../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../stores/colors/colors.store';
import { IBaseCirculaire, IBaseColor } from '../../../models/data/base-data-models';
import { ColorBadgeComponent, ColorBadgeData } from '../../shared/color-badge/color-badge.component';

@Component({
  selector: 'app-circulaires-collection',
  standalone: true,
  imports: [CommonModule, ColorBadgeComponent],
  templateUrl: './circulaires-collection.component.html',
  styleUrl: './circulaires-collection.component.scss'
})
export class CirculairesCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseCirculaire>();
  
  private circulaireStore = inject(CirculaireStore);
  private circulaireColorStore = inject(CirculaireColorStore);
  private colorStore = inject(ColorStore);
  
  protected circulaires = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allCirculaires = this.circulaireStore.entities();
    
    const filteredCirculaires = !term 
      ? allCirculaires
      : allCirculaires.filter(circ => circ.name?.toLowerCase().includes(term));
    
    return filteredCirculaires.map(circulaire => {
      const circulaireColors = this.circulaireColorStore.getByCirculaireId(circulaire.id)();
      const colors: ColorBadgeData[] = [];
      
      circulaireColors.forEach(cc => {
        cc.colorIds.forEach(colorId => {
          const color = this.colorStore.getById(colorId)();
          if (color && color.name && color.colorData) {
            colors.push({
              id: color.id,
              name: color.name,
              colorData: color.colorData
            });
          }
        });
      });
      
      return {
        circulaire,
        colors
      };
    });
  });
  
  protected onSelect(circulaire: IBaseCirculaire): void {
    if (this.selectable()) {
      this.selection.emit(circulaire);
    }
  }
}
