import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccommodationsService } from '../../../../core/services/accommodations.service';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { AccommodationItemComponent } from '../../../accommodations/components/accommodation-item/accommodation-item.component';

@Component({
  selector: 'app-recent-accommodations',
  imports: [AccommodationItemComponent, RouterLink],
  templateUrl: './recent-accommodations.component.html',
  styleUrl: './recent-accommodations.component.css',
})
export class RecentAccommodationsComponent implements OnInit, OnDestroy {
  private readonly accommodationsService = inject(AccommodationsService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly mobileSwipeThresholdPx = 48;
  private readonly autoplayIntervalMs = 30000;
  private recentCarouselStart = 0;
  private touchStartX = 0;
  private pointerStartX = 0;
  private isPointerDragging = false;
  private autoplayIntervalId: ReturnType<typeof setInterval> | null = null;
  private isAutoplayPausedByInteraction = false;
  private currentStartIndex = 0;

  recentError: string | null = null;
  isRecentLoading = true;
  recentAccommodations: Accommodation[] = [];
  cardsPerView = 3;
  autoplayEnabled = false;

  ngOnInit(): void {
    this.cardsPerView = this.getCardsPerView();
    this.loadRecentAccommodations();
  }

  ngOnDestroy(): void {
    this.clearAutoplayInterval();
  }

  get maxStartIndex(): number {
    return Math.max(this.recentAccommodations.length - this.cardsPerView, 0);
  }

  get canSlideRecent(): boolean {
    return this.totalPages > 1;
  }

  get totalPages(): number {
    if (this.recentAccommodations.length === 0 || this.recentAccommodations.length <= this.cardsPerView) {
      return 0;
    }
    return this.maxStartIndex + 1;
  }

  get currentPage(): number {
    if (this.recentAccommodations.length === 0 || this.recentAccommodations.length <= this.cardsPerView) {
      return 0;
    }
    return this.currentStartIndex;
  }

  get pageIndexes(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get trackTransform(): string {
    const stepPercent = 100 / this.cardsPerView;
    return `translate3d(-${this.currentPage * stepPercent}%, 0, 0)`;
  }

  get showLeftArrow(): boolean {
    return this.canSlideRecent && this.currentPage > 0;
  }

  get showRightArrow(): boolean {
    return this.canSlideRecent && this.currentPage < this.totalPages - 1;
  }

  get isAutoplayPaused(): boolean {
    return this.autoplayEnabled && this.canSlideRecent && this.isAutoplayPausedByInteraction;
  }

  nextRecent(): void {
    if (!this.showRightArrow) {
      return;
    }

    this.currentStartIndex = Math.min(this.currentStartIndex + 1, this.maxStartIndex);
    this.recentCarouselStart = this.currentStartIndex;
    this.syncAutoplayState();
  }

  prevRecent(): void {
    if (!this.showLeftArrow) {
      return;
    }

    this.currentStartIndex = Math.max(this.currentStartIndex - 1, 0);
    this.recentCarouselStart = this.currentStartIndex;
    this.syncAutoplayState();
  }

  goToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= this.totalPages) {
      return;
    }
    this.currentStartIndex = Math.min(pageIndex, this.maxStartIndex);
    this.recentCarouselStart = this.currentStartIndex;
    this.syncAutoplayState();
  }

  toggleAutoplay(): void {
    this.autoplayEnabled = !this.autoplayEnabled;
    this.syncAutoplayState();
  }

  onViewportMouseEnter(): void {
    this.isAutoplayPausedByInteraction = true;
    this.syncAutoplayState();
  }

  onViewportMouseLeave(): void {
    this.isAutoplayPausedByInteraction = false;
    this.syncAutoplayState();
  }

  onViewportFocusIn(): void {
    this.isAutoplayPausedByInteraction = true;
    this.syncAutoplayState();
  }

  onViewportFocusOut(): void {
    this.isAutoplayPausedByInteraction = false;
    this.syncAutoplayState();
  }

  onViewportKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextRecent();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prevRecent();
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0 || this.cardsPerView !== 1) {
      return;
    }
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 0 || this.cardsPerView !== 1) {
      return;
    }
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    this.handleHorizontalGesture(deltaX);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.cardsPerView !== 1 || event.pointerType === 'touch') {
      return;
    }
    this.isPointerDragging = true;
    this.pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDragging || this.cardsPerView !== 1 || event.pointerType === 'touch') {
      return;
    }
    const deltaX = event.clientX - this.pointerStartX;
    this.isPointerDragging = false;
    this.handleHorizontalGesture(deltaX);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const nextCardsPerView = this.getCardsPerView();
    if (nextCardsPerView === this.cardsPerView) {
      return;
    }

    const previousPage = this.currentPage;
    this.cardsPerView = nextCardsPerView;
    this.currentStartIndex = Math.min(previousPage, this.maxStartIndex);
    this.recentCarouselStart = this.currentStartIndex;
    this.syncAutoplayState();
  }

  private loadRecentAccommodations(): void {
    this.accommodationsService
      .getAll()
      .pipe(
        take(1),
        catchError(() => {
          this.recentError = 'We could not load accommodations right now.';
          return of([] as Accommodation[]);
        }),
      )
      .subscribe((rows) => {
        this.recentAccommodations = this.getMostRecent(rows, 9);
        this.currentStartIndex = 0;
        this.recentCarouselStart = 0;
        this.isRecentLoading = false;
        this.syncAutoplayState();
      });
  }

  private getMostRecent(rows: Accommodation[], maxItems: number): Accommodation[] {
    return [...rows]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, maxItems);
  }

  private handleHorizontalGesture(deltaX: number): void {
    if (Math.abs(deltaX) < this.mobileSwipeThresholdPx) {
      return;
    }

    if (deltaX < 0) {
      this.nextRecent();
      return;
    }

    this.prevRecent();
  }

  private getCardsPerView(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 3;
    }

    const width = window.innerWidth;
    if (width < 768) {
      return 1;
    }
    if (width < 1024) {
      return 2;
    }
    return 3;
  }

  private syncAutoplayState(): void {
    const shouldRun =
      this.autoplayEnabled &&
      this.canSlideRecent &&
      !this.isAutoplayPausedByInteraction &&
      !this.isRecentLoading &&
      !this.recentError;

    if (!shouldRun) {
      this.clearAutoplayInterval();
      return;
    }

    if (this.autoplayIntervalId) {
      return;
    }

    this.autoplayIntervalId = setInterval(() => {
      this.advanceAutoplay();
    }, this.autoplayIntervalMs);
  }

  private advanceAutoplay(): void {
    if (!this.canSlideRecent) {
      return;
    }

    if (this.showRightArrow) {
      this.nextRecent();
      return;
    }

    this.currentStartIndex = 0;
    this.recentCarouselStart = 0;
    this.syncAutoplayState();
  }

  private clearAutoplayInterval(): void {
    if (!this.autoplayIntervalId) {
      return;
    }
    clearInterval(this.autoplayIntervalId);
    this.autoplayIntervalId = null;
  }
}
