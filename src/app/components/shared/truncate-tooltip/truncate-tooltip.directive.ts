import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[truncateTooltip]',
  standalone: true,
  hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: truncateTooltip', 'matTooltipShowDelay'] }],
})
export class TruncateTooltipDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly tooltip = inject(MatTooltip);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const el = this.el.nativeElement;
    this.tooltip.disabled = el.scrollWidth <= el.clientWidth;
  }
}
