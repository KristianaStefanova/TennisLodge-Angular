import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccommodationsService } from '../../core/services/accommodations.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly cityControl = new FormControl('', { nonNullable: true });
  readonly suggestionsListId = 'home-city-suggestions';

  private readonly router = inject(Router);
  private readonly accommodationsService = inject(AccommodationsService);
  private readonly destroyRef = inject(DestroyRef);

  private allCities: string[] = [];
  private blurTimeout: ReturnType<typeof setTimeout> | null = null;

  searchError: string | null = null;
  isSuggestionsOpen = false;
  filteredCities: string[] = [];
  activeSuggestionIndex = -1;

  constructor() {
    this.cityControl.valueChanges
      .pipe(
        startWith(this.cityControl.value),
        map((value) => this.getSuggestions(value)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cities) => {
        this.filteredCities = cities;
        this.activeSuggestionIndex = cities.length > 0 ? 0 : -1;
        if (!this.cityControl.value.trim()) {
          this.searchError = null;
        }
      });

    /**
     * Suggestions = distinct cities from existing accommodations only (no static list).
     * If the API returns 401 for guests, catchError yields [] — user can still type a city manually.
     */
    this.accommodationsService
      .getAll()
      .pipe(
        take(1),
        map((rows) =>
          this.uniqueCityLabels(
            rows
              .map((row) => row.city)
              .filter((city): city is string => typeof city === 'string' && city.trim().length > 0),
          ),
        ),
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cities) => {
        this.allCities = cities;
        this.filteredCities = this.getSuggestions(this.cityControl.value);
      });
  }

  onSearchSubmit(): void {
    const city = this.cityControl.value.trim();
    if (!city) {
      this.searchError = 'Please enter a city to start your search.';
      this.isSuggestionsOpen = false;
      return;
    }

    this.searchError = null;
    this.isSuggestionsOpen = false;
    void this.router.navigate(['/accommodations'], {
      queryParams: { city: this.toTitleCase(city) },
    });
  }

  onInputFocus(): void {
    this.clearBlurTimeout();
    this.isSuggestionsOpen = this.filteredCities.length > 0;
  }

  onInputBlur(): void {
    this.clearBlurTimeout();
    this.blurTimeout = setTimeout(() => {
      this.isSuggestionsOpen = false;
    }, 120);
  }

  onSuggestionPointerDown(event: MouseEvent): void {
    event.preventDefault();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (!this.isSuggestionsOpen || this.filteredCities.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.filteredCities.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex =
        (this.activeSuggestionIndex - 1 + this.filteredCities.length) % this.filteredCities.length;
      return;
    }

    if (event.key === 'Escape') {
      this.isSuggestionsOpen = false;
      return;
    }

    if (event.key === 'Enter' && this.activeSuggestionIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(this.filteredCities[this.activeSuggestionIndex]);
    }
  }

  selectSuggestion(city: string): void {
    this.searchError = null;
    this.cityControl.setValue(city);
    this.isSuggestionsOpen = false;
    this.onSearchSubmit();
  }

  private clearBlurTimeout(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }

  private getSuggestions(value: string): string[] {
    const query = value.trim().toLocaleLowerCase();
    if (!query) {
      return this.allCities.slice(0, 6);
    }

    return this.allCities
      .filter((city) => city.toLocaleLowerCase().includes(query))
      .slice(0, 6);
  }

  private uniqueCityLabels(cities: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of cities) {
      const t = raw.trim();
      if (!t) continue;
      const key = t.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(this.toTitleCase(t));
    }
    return out.sort((a, b) => a.localeCompare(b));
  }

  private toTitleCase(value: string): string {
    return value
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase())
      .join(' ');
  }
}
