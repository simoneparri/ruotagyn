import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { addDays, formatDate } from './gestation';

interface Point { x: number; y: number }

const INDICATORS = [
  { id: 'lmp', number: 1, label: 'Ultima mestruazione', lines: ['Ultima', 'mestruazione'], days: 0, color: '#526b4b' },
  { id: 'conception', number: 2, label: 'Concepimento stimato', lines: ['Concepimento', 'stimato'], days: 14, color: '#72608c' },
  { id: 'missed-period', number: 3, label: 'Mestruazione mancata stimata', lines: ['Mestruazione', 'mancata stimata'], days: 28, color: '#386d87' },
  { id: 'due-date', number: 4, label: 'Data presunta del parto', lines: ['Data presunta', 'del parto'], days: 280, color: '#a65f42' },
] as const;

@Component({
  selector: 'app-wheel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 560 560" role="slider" tabindex="0"
      aria-label="Ruota per modificare l’ultima mestruazione" aria-orientation="horizontal"
      [attr.aria-valuemin]="minimumDay" [attr.aria-valuemax]="maximumDay()"
      [attr.aria-valuenow]="currentDay()" [attr.aria-valuetext]="description()"
      [attr.aria-describedby]="wheelOnly() ? null : 'wheel-help indicator-assumptions'"
      [attr.aria-description]="wheelOnly() ? 'Trascina per cambiare la data. Frecce: un giorno. Pagina su e giù: sette giorni. Concepimento e mestruazione mancata sono stime convenzionali su un ciclo di 28 giorni.' : null"
      [class.dragging]="dragging()"
      (pointerdown)="startDrag($event)" (pointermove)="moveDrag($event)"
      (pointerup)="endDrag($event)" (pointercancel)="endDrag($event)"
      (lostpointercapture)="endDrag($event)" (keydown)="onKeydown($event)">
      <defs>
        <filter id="disc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#344b3b" flood-opacity=".07"/>
        </filter>
      </defs>
      <circle cx="280" cy="280" r="268" fill="#fff" filter="url(#disc-shadow)"/>
      <circle cx="280" cy="280" r="260" fill="#eeeee5"/>
      @for (month of months(); track month.key) {
        <path [attr.d]="arc(month.start, month.end, 236)" fill="none"
          [attr.stroke]="month.index % 2 === 0 ? '#e6e9dc' : '#f1f0e7'" stroke-width="46"/>
        <text [attr.x]="point(month.mid, 241).x" [attr.y]="point(month.mid, 241).y"
          [attr.transform]="rotation(month.mid, 241)" class="month">{{ month.label }}</text>
      }
      <circle cx="280" cy="280" r="212" fill="none" stroke="#fff" stroke-width="2"/>
      @for (tick of calendarTicks(); track tick.day) {
        <line [attr.x1]="point(tick.angle, 211).x" [attr.y1]="point(tick.angle, 211).y"
          [attr.x2]="point(tick.angle, tick.major ? 223 : 217).x"
          [attr.y2]="point(tick.angle, tick.major ? 223 : 217).y"
          [attr.stroke]="tick.major ? '#768172' : '#bac0b3'" stroke-width="1"/>
        @if (tick.major) {
          <text [attr.x]="point(tick.angle, 230).x" [attr.y]="point(tick.angle, 230).y"
            [attr.transform]="rotation(tick.angle, 230)" class="day">{{ tick.label }}</text>
        }
      }
      <circle cx="280" cy="280" r="191" fill="none" stroke="#f1eee9" stroke-width="31"/>
      <path [attr.d]="arc(angle(0), angle(98), 191)" fill="none" stroke="#d9e3ce" stroke-width="31"/>
      <path [attr.d]="arc(angle(98), angle(196), 191)" fill="none" stroke="#e2d9ec" stroke-width="31"/>
      <path [attr.d]="arc(angle(196), angle(280), 191)" fill="none" stroke="#f1d8c8" stroke-width="31"/>
      @for (week of weeks; track week) {
        <line [attr.x1]="point(angle(week * 7), 177).x" [attr.y1]="point(angle(week * 7), 177).y"
          [attr.x2]="point(angle(week * 7), week % 5 === 0 ? 190 : 184).x"
          [attr.y2]="point(angle(week * 7), week % 5 === 0 ? 190 : 184).y"
          stroke="#748073" stroke-width="1"/>
        <text [attr.x]="point(angle(week * 7), 164).x" [attr.y]="point(angle(week * 7), 164).y"
          [attr.transform]="rotation(angle(week * 7), 164)" class="week">{{ week }}</text>
      }
      <circle cx="280" cy="280" r="144" fill="none" stroke="#e9e9e0" stroke-dasharray="2 5"/>
      <line [attr.x1]="point(angle(selectedDays()), 20).x" [attr.y1]="point(angle(selectedDays()), 20).y"
        [attr.x2]="point(angle(selectedDays()), 204).x" [attr.y2]="point(angle(selectedDays()), 204).y"
        stroke="#425c51" stroke-width="2.5"/>
      <circle [attr.cx]="point(angle(selectedDays()), 202).x"
        [attr.cy]="point(angle(selectedDays()), 202).y" r="8" fill="#425c51" stroke="#fff" stroke-width="3"/>
      @for (indicator of indicators(); track indicator.id) {
        <g class="indicator-hand" [attr.data-indicator]="indicator.id" [attr.data-days]="indicator.days"
          [attr.data-date]="indicator.date" [attr.data-angle]="angle(indicator.days)">
          <title>{{ indicator.number }}. {{ indicator.label }}: {{ indicator.formattedDate }}</title>
          <g [attr.transform]="'rotate(' + angle(indicator.days) + ' 280 280)'">
            <line x1="280" y1="280" x2="280" y2="76" [attr.stroke]="indicator.color" stroke-width="2"/>
            <path d="M 280 69 L 275 81 L 285 81 Z" [attr.fill]="indicator.color"/>
          </g>
          <text [attr.transform]="handLabelTransform(angle(indicator.days))"
            [style.fill]="indicator.color"
            [style.text-anchor]="handLabelFlipped(angle(indicator.days)) ? 'end' : 'start'"
            class="hand-label"><tspan x="0" dy="-4">{{ indicator.lines[0] }} </tspan><tspan x="0" dy="11">{{ indicator.lines[1] }}</tspan></text>
          <circle [attr.cx]="point(angle(indicator.days), 207).x" [attr.cy]="point(angle(indicator.days), 207).y"
            r="8" [attr.fill]="indicator.color" stroke="#fffefa" stroke-width="1.5"/>
          <text [attr.x]="point(angle(indicator.days), 207).x"
            [attr.y]="point(angle(indicator.days), 207).y" class="hand-number">{{ indicator.number }}</text>
        </g>
      }
      <circle cx="280" cy="280" r="13" fill="#425c51" stroke="#fffefa" stroke-width="3"/>
      <circle cx="280" cy="280" r="4" fill="#d7dfcd"/>
    </svg>
    @if (!wheelOnly()) {
    <div class="wheel-readout">
      <span>{{ selectedDate() === latestDate() ? 'OGGI' : 'DATA SELEZIONATA' }} · SETTIMANE COMPLETE</span>
      <strong>{{ selectedWeeks() }} <small>+ {{ remainder() }} giorni</small></strong>
      <span>{{ selectedDate() }}</span>
    </div>
    <ol class="indicator-list" aria-label="Lancette del regolo ostetrico">
      @for (indicator of indicators(); track indicator.id) {
        <li [attr.data-indicator]="indicator.id">
          <span class="indicator-number" [style.background]="indicator.color">{{ indicator.number }}</span>
          <div><span>{{ indicator.label }}</span><time [attr.datetime]="indicator.date">{{ indicator.formattedDate }}</time></div>
        </li>
      }
    </ol>
    <p class="indicator-assumptions" id="indicator-assumptions">Stime su ciclo convenzionale di 28 giorni:
      concepimento a +14 giorni, mestruazione mancata a +28, parto a +280 dall’ultima mestruazione.
      Non confermano concepimento o ritardo effettivi e possono variare con il ciclo.</p>
    <details class="wheel-help-accordion">
      <summary>Accessibilità e comandi</summary>
      <p id="wheel-help" class="interaction-help">Trascina per cambiare l’ultima mestruazione.
      <span>Orario: data più recente · Antiorario: data precedente.<br>
      Da tastiera: frecce ±1 giorno, Pag ↑ / Pag ↓ ±7 giorni.</span></p>
    </details>
    }
    <p class="interaction-status" [class.sr-only]="wheelOnly()" role="status">{{ interactionStatus() }}</p>
  `,
  styles: `
    :host { display: block; width: 100%; max-width: 550px; margin: auto; }
    svg { display: block; width: 100%; height: auto; overflow: visible; cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; border-radius: 50%; }
    svg.dragging { cursor: grabbing; }
    svg:focus-visible { outline: 3px solid #aa6248; outline-offset: 3px; }
    .interaction-help { text-align: center; color: #53694c; font-size: 12px; line-height: 1.7; margin: 10px 0; }
    .interaction-help span { display: block; color: #737b70; font-size: 10px; }
    .wheel-help-accordion { border-top: 1px solid #e6e7dd; margin-top: 12px; }
    .wheel-help-accordion summary { cursor: pointer; min-height: 44px; padding: 14px 8px; color: #425c51; font-size: 12px; font-weight: 600; }
    .wheel-help-accordion summary:focus-visible { outline: 3px solid #aa6248; outline-offset: 3px; }
    .interaction-status { text-align: center; color: #9c3d2c; font-size: 11px; margin: 6px 0; }
    .interaction-status:empty { display: none; }
    :host(.compact) .indicator-list { display: none; }
    text { text-anchor: middle; dominant-baseline: middle; fill: #465647; font-family: "Segoe UI", sans-serif; }
    .month { font-size: 10px; font-weight: 650; letter-spacing: 1.3px; }
    .day { font-size: 8px; fill: #66745f; }
    .week { font-size: 9px; font-weight: 600; }
    .hand-label { font-size: 10px; font-weight: 600; paint-order: stroke; stroke: #fffefa; stroke-width: 3px; stroke-linejoin: round; }
    .hand-number { fill: #fff; font-size: 9px; font-weight: 700; }
    .wheel-readout { text-align: center; padding: 8px 0 16px; }
    .wheel-readout > span { display: block; color: #67735f; font-size: 11px; }
    .wheel-readout > span:first-child { font-size: 9px; letter-spacing: 1px; }
    .wheel-readout strong { display: block; font-family: Georgia, serif; font-size: 38px; font-weight: 400; margin: 4px 0; }
    .wheel-readout small { font-family: "Segoe UI", sans-serif; font-size: 15px; }
    .indicator-list { list-style: none; padding: 14px 0; margin: 0; border-top: 1px solid #e6e7dd; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
    .indicator-list li { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
    .indicator-number { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: #fff; flex-shrink: 0; font-size: 11px; }
    .indicator-list li div > span { display: block; font-size: 11px; line-height: 1.5; color: #53614c; }
    .indicator-list time { display: block; font-size: 12px; line-height: 1.6; color: #344d40; font-weight: 600; }
    .indicator-assumptions { font-size: 10px; line-height: 1.7; color: #737b70; margin: 0 0 12px; }
    @media (max-width: 520px) {
      .indicator-list, .indicator-assumptions { margin-left: 9px; margin-right: 9px; }
    }
    @media (max-width: 359px) { .indicator-list { grid-template-columns: 1fr; } }
  `,
})
export class Wheel {
  readonly lmp = input.required<string>();
  readonly latestDate = input.required<string>();
  readonly selectedDays = input.required<number>();
  readonly wheelOnly = input(false);
  readonly lmpChange = output<string>();
  readonly draggingChange = output<boolean>();
  readonly dragging = signal(false);
  readonly interactionStatus = signal('');
  readonly minimumDay = this.epoch('1900-01-01') / 86_400_000;
  readonly maximumDay = computed(() => this.epoch(this.latestDate()) / 86_400_000);
  readonly currentDay = computed(() => this.epoch(this.lmp()) / 86_400_000);
  private readonly calendarOrigin = signal<string | null>(null);
  private drag: { pointerId: number; lastAngle: number; day: number } | null = null;
  readonly weeks = Array.from({ length: 43 }, (_, index) => index);
  readonly selectedWeeks = computed(() => Math.floor(this.selectedDays() / 7));
  readonly remainder = computed(() => this.selectedDays() % 7);
  readonly indicators = computed(() => INDICATORS.map((indicator) => {
    const date = addDays(this.lmp(), indicator.days);
    return { ...indicator, date, formattedDate: formatDate(date) };
  }));
  readonly selectedDate = computed(() => formatDate(addDays(this.lmp(), this.selectedDays())));
  readonly description = computed(() =>
    `Ultima mestruazione: ${formatDate(this.lmp())}. Regolo ostetrico: ${this.selectedWeeks()} settimane complete e ${this.remainder()} giorni, ${this.selectedDate()}. ` +
    'Anello esterno: calendario. Anello interno: settimane dalla data di ultima mestruazione. ' +
    this.indicators().map((indicator) => `${indicator.label}: ${indicator.formattedDate}.`).join(' ') + ' ' +
    (this.wheelOnly() ? 'Usa le frecce per cambiare la data di un giorno o Pagina su e giù per sette giorni.' :
      'Usa i controlli sotto la ruota per esplorare le settimane.'),
  );
  private readonly origin = computed(() => this.calendarOrigin() ?? `${this.lmp().slice(0, 7)}-01`);
  private readonly yearDays = computed(() => {
    const date = new Date(`${this.origin()}T00:00:00Z`);
    const year = date.getUTCFullYear();
    return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
  });
  readonly months = computed(() => {
    const year = new Date(`${this.origin()}T00:00:00Z`).getUTCFullYear();
    const yearStart = Date.UTC(year, 0, 1);
    const januaryMidpoint = (Date.UTC(year, 1, 1) - yearStart) / 2 / 86_400_000;
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(Date.UTC(year, index, 1));
      const end = new Date(Date.UTC(year, index + 1, 1));
      const startAngle = this.calendarAngle(start.getTime(), yearStart, januaryMidpoint);
      const endAngle = this.calendarAngle(end.getTime(), yearStart, januaryMidpoint);
      return {
        key: start.toISOString(), index, start: startAngle, end: endAngle,
        mid: (startAngle + endAngle) / 2,
        label: new Intl.DateTimeFormat('it', { month: 'long', timeZone: 'UTC' }).format(start).toUpperCase(),
      };
    });
  });
  readonly calendarTicks = computed(() => {
    const year = new Date(`${this.origin()}T00:00:00Z`).getUTCFullYear();
    const yearStart = Date.UTC(year, 0, 1);
    const januaryMidpoint = (Date.UTC(year, 1, 1) - yearStart) / 2 / 86_400_000;
    return Array.from({ length: this.yearDays() }, (_, day) => {
      const date = new Date(yearStart + day * 86_400_000);
      const label = date.getUTCDate();
      return {
        day, label, angle: this.calendarAngle(date.getTime(), yearStart, januaryMidpoint),
        major: [1, 7, 14, 21, 28].includes(label),
      };
    });
  });

  startDrag(event: PointerEvent): void {
    if (this.drag || !event.isPrimary || event.button !== 0) return;
    const angle = this.pointerAngle(event);
    if (angle === null) return;
    this.calendarOrigin.set(this.origin());
    this.drag = { pointerId: event.pointerId, lastAngle: angle, day: this.currentDay() };
    const svg = event.currentTarget as SVGSVGElement;
    svg.setPointerCapture(event.pointerId);
    svg.focus({ preventScroll: true });
    this.dragging.set(true);
    this.draggingChange.emit(true);
    this.interactionStatus.set('');
    event.preventDefault();
  }

  moveDrag(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const angle = this.pointerAngle(event);
    if (angle === null) return;
    // Unwrap each movement so crossing the top or making multiple turns stays continuous.
    const delta = ((angle - drag.lastAngle + 540) % 360) - 180;
    drag.lastAngle = angle;
    drag.day = this.limitDay(drag.day + delta / 360 * this.yearDays());
    this.emitDay(Math.round(drag.day));
  }

  endDrag(event: PointerEvent): void {
    if (this.drag?.pointerId !== event.pointerId) return;
    this.drag = null;
    this.dragging.set(false);
    this.draggingChange.emit(false);
    const svg = event.currentTarget as SVGSVGElement;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  }

  onKeydown(event: KeyboardEvent): void {
    const increments: Record<string, number> = {
      ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 7, PageDown: -7,
    };
    const increment = increments[event.key];
    if (increment === undefined) return;
    event.preventDefault();
    this.calendarOrigin.set(this.origin());
    this.emitDay(Math.round(this.limitDay(this.currentDay() + increment)));
  }

  private pointerAngle(event: PointerEvent): number | null {
    const bounds = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    // The center has no reliable angular direction and remains a safe place to tap.
    if (Math.hypot(x, y) < bounds.width * .12) return null;
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  private limitDay(day: number): number {
    const bounded = Math.min(this.maximumDay(), Math.max(this.minimumDay, day));
    this.interactionStatus.set(day > this.maximumDay()
      ? 'Limite raggiunto: l’ultima mestruazione non può essere futura.'
      : day < this.minimumDay ? 'Limite raggiunto: la data minima è il 1 gennaio 1900.' : '');
    return bounded;
  }

  private emitDay(day: number): void {
    if (day !== this.currentDay()) {
      this.lmpChange.emit(new Date(day * 86_400_000).toISOString().slice(0, 10));
    }
  }
  angle(days: number): number {
    const origin = this.origin();
    const year = new Date(`${origin}T00:00:00Z`).getUTCFullYear();
    const yearStart = Date.UTC(year, 0, 1);
    const januaryMidpoint = (Date.UTC(year, 1, 1) - yearStart) / 2 / 86_400_000;
    const day = (this.epoch(this.lmp()) - yearStart) / 86_400_000 + days;
    return ((day - januaryMidpoint) / this.yearDays() * 360 + 360) % 360;
  }
  handLabelFlipped(angle: number): boolean {
    return ((angle % 360) + 360) % 360 > 180;
  }
  handLabelTransform(angle: number): string {
    const start = this.point(angle, 85);
    const radians = angle * Math.PI / 180;
    return `translate(${start.x + 7 * Math.cos(radians)} ${start.y + 7 * Math.sin(radians)}) rotate(${angle - 90 + (this.handLabelFlipped(angle) ? 180 : 0)})`;
  }
  point(angle: number, radius: number): Point {
    const radians = (angle - 90) * Math.PI / 180;
    return { x: 280 + radius * Math.cos(radians), y: 280 + radius * Math.sin(radians) };
  }
  rotation(angle: number, radius: number): string {
    const point = this.point(angle, radius);
    const normalized = ((angle % 360) + 360) % 360;
    return `rotate(${normalized > 90 && normalized < 270 ? angle + 180 : angle} ${point.x} ${point.y})`;
  }
  arc(start: number, end: number, radius: number): string {
    const first = this.point(start, radius);
    const last = this.point(end, radius);
    return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${last.x} ${last.y}`;
  }
  private calendarAngle(timestamp: number, yearStart: number, januaryMidpoint: number): number {
    const day = (timestamp - yearStart) / 86_400_000;
    return (day - januaryMidpoint) / this.yearDays() * 360;
  }
  private epoch(iso: string): number {
    return new Date(`${iso}T00:00:00Z`).getTime();
  }
}
