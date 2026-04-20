import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { AccommodationItemComponent } from '../../components/accommodation-item/accommodation-item.component';
import { loadAccommodations } from '../../../../store/accommodations/accommodation.actions';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import {
  selectAccommodationsError,
  selectAccommodationsLoading,
  selectAllAccommodations,
} from '../../../../store/accommodations/accommodation.selectors';

@Component({
  selector: 'app-accommodation-list-page',
  imports: [RouterLink, AccommodationItemComponent, AsyncPipe],
  templateUrl: './accommodation-list.page.html',
  styleUrl: './accommodation-list.page.css',
})
export class AccommodationListPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  readonly loading$: Observable<boolean> = this.store.select(selectAccommodationsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectAccommodationsError);
  readonly accommodations$: Observable<Accommodation[]> = this.store.select(selectAllAccommodations);
  readonly cityFilter$: Observable<string> = this.route.queryParamMap.pipe(
    map((params) => params.get('city')?.trim() ?? ''),
  );
  readonly filteredAccommodations$: Observable<Accommodation[]> = combineLatest([
    this.accommodations$,
    this.cityFilter$,
  ]).pipe(
    map(([accommodations, city]) => {
      if (!city) {
        return accommodations;
      }

      const search = city.toLocaleLowerCase();
      return accommodations.filter((accommodation) =>
        accommodation.city.toLocaleLowerCase().includes(search),
      );
    }),
  );

  ngOnInit(): void {
    this.store.dispatch(loadAccommodations());
  }
}
