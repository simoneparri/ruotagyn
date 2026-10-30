import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { REFERENCE_SOURCES, formatReference, weeklyReferences } from './weekly-references';

const WEEK_ANGLE = 7.5;

@Component({
  selector: 'app-weekly-wheel',
  templateUrl: './weekly-wheel.html',
  styleUrl: './weekly-wheel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyWheel {
  readonly week = signal(20);
  readonly dragging = signal(false);
  readonly weeks = Array.from({ length: 43 }, (_, index) => index);
  readonly references = computed(() => weeklyReferences(this.week()));
  readonly rotation = computed(() => `rotate(${this.week() * WEEK_ANGLE} 280 280)`);
  readonly sources = REFERENCE_SOURCES;
  readonly sourcesInitiallyOpen = window.location.hash.startsWith('#source-');
  readonly formatReference = formatReference;
  private pointerId: number | null = null;
  private previousAngle = 0;
  private dragWeek = 20;

  point(week: number, radius: number): { x: number; y: number } {
    const radians = (-week * WEEK_ANGLE - 90) * Math.PI / 180;
    return { x: 280 + radius * Math.cos(radians), y: 280 + radius * Math.sin(radians) };
  }

  weekArc(week: number): string {
    const start = this.point(week - .5, 243);
    const end = this.point(week + .5, 243);
    return `M ${start.x} ${start.y} A 243 243 0 0 0 ${end.x} ${end.y}`;
  }

  selectWeek(week: number): void {
    this.week.set(Math.max(0, Math.min(42, Math.round(week))));
  }

  slide(event: Event): void {
    this.selectWeek(Number((event.target as HTMLInputElement).value));
  }

  onKeydown(event: KeyboardEvent): void {
    const changes: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 4, PageDown: -4 };
    if (event.key === 'Home') this.selectWeek(0);
    else if (event.key === 'End') this.selectWeek(42);
    else if (event.key in changes) this.selectWeek(this.week() + changes[event.key]);
    else return;
    event.preventDefault();
  }

  startDrag(event: PointerEvent): void {
    if (this.pointerId !== null || !event.isPrimary || event.button !== 0) return;
    const point = this.eventPoint(event);
    if (!point || Math.hypot(point.x - 280, point.y - 280) < 220) return;
    const svg = event.currentTarget as SVGSVGElement;
    this.pointerId = event.pointerId;
    this.previousAngle = Math.atan2(point.y - 280, point.x - 280) * 180 / Math.PI;
    this.dragWeek = this.week();
    svg.setPointerCapture(event.pointerId);
    svg.focus({ preventScroll: true });
    this.dragging.set(true);
    event.preventDefault();
  }

  moveDrag(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    const point = this.eventPoint(event);
    if (!point) return;
    const angle = Math.atan2(point.y - 280, point.x - 280) * 180 / Math.PI;
    const delta = ((angle - this.previousAngle + 540) % 360) - 180;
    this.previousAngle = angle;
    this.dragWeek = Math.max(0, Math.min(42, this.dragWeek + delta / WEEK_ANGLE));
    this.selectWeek(this.dragWeek);
  }

  endDrag(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.dragging.set(false);
    const svg = event.currentTarget as SVGSVGElement;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  }

  private eventPoint(event: PointerEvent): DOMPoint | null {
    const matrix = (event.currentTarget as SVGSVGElement).getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }
}
