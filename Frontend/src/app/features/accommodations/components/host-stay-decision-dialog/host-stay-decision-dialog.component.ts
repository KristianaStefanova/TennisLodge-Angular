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
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-host-stay-decision-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './host-stay-decision-dialog.component.html',
  styleUrl: './host-stay-decision-dialog.component.css',
})
export class HostStayDecisionDialogComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly mode = input.required<'accept' | 'reject'>();
  readonly guestLabel = input('');
  readonly busy = input(false);

  readonly confirm = output<{ message: string }>();
  readonly cancelled = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly message = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(500)],
  });

  private focusBefore: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.message.setValue('');
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
    const initial = root?.querySelector<HTMLElement>('[data-hsd-initial-focus]');
    initial?.focus();
  }

  private restoreFocus(): void {
    if (this.focusBefore && typeof this.focusBefore.focus === 'function') {
      this.focusBefore.focus();
    }
    this.focusBefore = null;
  }

  title(): string {
    return this.mode() === 'accept' ? 'Accept this stay request?' : 'Reject this stay request?';
  }

  lead(): string {
    return this.mode() === 'accept'
      ? 'The guest will be notified. You can add an optional message for them.'
      : 'The guest will be notified. You can add an optional message explaining why.';
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
    if (this.message.invalid) {
      this.message.markAsTouched();
      return;
    }
    this.confirm.emit({ message: this.message.value.trim() });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.busy()) {
      this.cancelled.emit();
    }
  }
}
