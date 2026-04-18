import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { formatDistanceToCourts } from '../../../../shared/utils/accommodation-distance.util';

@Component({
  selector: 'app-accommodation-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './accommodation-item.component.html',
  styleUrl: './accommodation-item.component.css',
})
export class AccommodationItemComponent {
  readonly accommodation = input.required<Accommodation>();

  readonly distanceLabel = formatDistanceToCourts;
}
