import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
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

  readonly loading$: Observable<boolean> = this.store.select(selectAccommodationsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectAccommodationsError);
  readonly accommodations$: Observable<Accommodation[]> = this.store.select(selectAllAccommodations);

  ngOnInit(): void {
    this.store.dispatch(loadAccommodations());
  }
}
