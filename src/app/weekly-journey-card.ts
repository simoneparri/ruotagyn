import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JOURNEY_SOURCES, weeklyJourney } from './weekly-journey';
import { REFERENCE_SOURCES } from './weekly-references';

@Component({
  selector: 'app-weekly-journey',
  templateUrl: './weekly-journey-card.html',
  styleUrl: './weekly-journey-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyJourneyCard {
  readonly week = input.required<number>();
  readonly content = computed(() => weeklyJourney(this.week()));
  readonly sources = [...Object.values(JOURNEY_SOURCES), ...REFERENCE_SOURCES.filter((source) => source.id === 'who' || source.id === 'crl')];
}
