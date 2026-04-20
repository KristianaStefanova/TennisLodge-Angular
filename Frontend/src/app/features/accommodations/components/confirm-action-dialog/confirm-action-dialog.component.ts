import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-action-dialog',
  templateUrl: './confirm-action-dialog.component.html',
  styleUrl: './confirm-action-dialog.component.css',
})
export class ConfirmActionDialogComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly title = input('Are you sure?');
  readonly description = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private focusBefore: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          const ae = this.document.activeElement;
          this.focusBefore = ae instanceof HTMLElement ? ae : null;
          this.document.body.style.overflow = 'hidden';
          queueMicrotask(() => {
            if (this.open()) {
              this.focusInitialControl();
            }
          });
        });
      } else {
        untracked(() => {
          this.document.body.style.overflow = '';
          this.restoreFocus();
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      this.document.body.style.overflow = '';
      this.restoreFocus();
    });
  }

  private focusInitialControl(): void {
    const root = this.panel()?.nativeElement;
    const initial = root?.querySelector<HTMLElement>('[data-confirm-initial-focus]');
    initial?.focus();
  }

  private restoreFocus(): void {
    if (this.focusBefore && typeof this.focusBefore.focus === 'function') {
      this.focusBefore.focus();
    }
    this.focusBefore = null;
  }

  onBackdropClick(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  onCancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    if (!this.busy()) {
      this.confirmed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.busy()) {
      this.cancelled.emit();
    }
  }
}
