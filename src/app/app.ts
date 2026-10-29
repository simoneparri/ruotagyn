import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { NgTemplateOutlet } from '@angular/common';
import { addDays, calculateGestation, formatDate, todayIso } from './gestation';
import { Wheel } from './wheel';
import { DATES_STORAGE_KEY, parseSavedDates } from './saved-dates';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Component({
  selector: 'app-root',
  imports: [Wheel, NgTemplateOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css', './fullscreen.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly updates = inject(SwUpdate);
  readonly today = signal(todayIso());
  readonly lmp = signal(addDays(this.today(), -143));
  readonly dueDate = signal(addDays(this.lmp(), 280));
  readonly compact = signal(false);
  readonly wheelExpanded = signal(false);
  readonly wheelDialog = viewChild<ElementRef<HTMLDialogElement>>('wheelDialog');
  readonly expandButton = viewChild<ElementRef<HTMLButtonElement>>('expandButton');
  readonly earliestDueDate = addDays('1900-01-01', 280);
  readonly latestDueDate = computed(() => addDays(this.today(), 280));
  readonly example = signal(true);
  readonly wheelDragging = signal(false);
  readonly selectedDays = signal(143);
  readonly error = signal('');
  readonly offline = signal(!navigator.onLine);
  readonly installPrompt = signal<InstallPromptEvent | null>(null);
  readonly installHelp = signal(false);
  readonly installed = signal(window.matchMedia('(display-mode: standalone)').matches);
  readonly installBusy = signal(false);
  readonly updateReady = signal(false);
  readonly updateDialog = viewChild<ElementRef<HTMLDialogElement>>('updateDialog');
  readonly status = signal('');
  readonly storageError = signal('');
  readonly calculation = computed(() => calculateGestation(this.lmp(), this.today()));
  readonly gestation = computed(() => {
    const result = this.calculation();
    return result.ok ? result.value : null;
  });
  readonly selectedWeek = computed(() => Math.floor(this.selectedDays() / 7));
  readonly selectedDate = computed(() => this.gestation() ? formatDate(addDays(this.lmp(), this.selectedDays())) : '');
  readonly previewing = computed(() => this.gestation()?.elapsedDays !== this.selectedDays());
  readonly daysToDue = computed(() => 280 - (this.gestation()?.elapsedDays ?? 0));
  readonly formatDate = formatDate;
  readonly ticks = [0, 7, 14, 21, 28, 35, 42];

  constructor() {
    effect(() => {
      const dialog = this.wheelDialog()?.nativeElement;
      if (!dialog) return;
      if (this.wheelExpanded() && !dialog.open) dialog.showModal();
      if (!this.wheelExpanded() && dialog.open) {
        dialog.close();
        this.expandButton()?.nativeElement.focus({ preventScroll: true });
      }
    });
    effect(() => {
      const dialog = this.updateDialog()?.nativeElement;
      if (!dialog) return;
      if (this.updateReady() && !dialog.open) dialog.showModal();
      if (!this.updateReady() && dialog.open) dialog.close();
    });
    this.restoreDates();
    const timer = window.setInterval(() => this.refreshToday(), 60_000);
    this.destroyRef.onDestroy(() => window.clearInterval(timer));
    if (this.updates.isEnabled) {
      const updateTimer = window.setInterval(() => {
        if (navigator.onLine && navigator.serviceWorker.controller) void this.checkForUpdate();
      }, 15 * 60_000);
      this.destroyRef.onDestroy(() => window.clearInterval(updateTimer));
      this.updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
        if (event.type === 'VERSION_READY') this.updateReady.set(true);
        if (event.type === 'VERSION_INSTALLATION_FAILED') {
          this.status.set('Aggiornamento non riuscito. La versione attuale resta disponibile; riprova con una connessione attiva.');
        }
      });
      this.updates.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => {
        this.status.set('Alcune risorse non sono più disponibili. Ricarica la pagina quando sei online. Le date salvate sul dispositivo saranno ripristinate.');
      });
    }
  }

  expandWheel(): void {
    this.wheelExpanded.set(true);
  }

  closeWheel(): void {
    this.wheelExpanded.set(false);
  }

  private async checkForUpdate(): Promise<void> {
    try {
      await this.updates.checkForUpdate();
    } catch {
      this.status.set('Impossibile verificare nuove versioni. Il controllo sarà ripetuto; puoi continuare a usare la versione attuale.');
    }
  }

  changeLmp(event: Event): void {
    this.setLmp((event.target as HTMLInputElement).value);
  }

  setLmp(value: string): void {
    this.example.set(false);
    this.lmp.set(value);
    const result = calculateGestation(value, this.today());
    this.dueDate.set(result.ok ? result.value.dueDate : '');
    this.error.set(result.ok ? '' : result.error);
    this.selectedDays.set(result.ok ? Math.min(result.value.elapsedDays, 294) : 0);
    this.persistDates();
  }

  changeDueDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    try {
      const lmp = addDays(value, -280);
      this.setLmp(lmp);
      this.dueDate.set(value);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      this.example.set(false);
      this.lmp.set('');
      this.dueDate.set(value);
      this.selectedDays.set(0);
      this.error.set(value
        ? 'Inserisci una data presunta del parto valida, non precedente al 8 ottobre 1900.'
        : 'Inserisci la data presunta del parto oppure l’ultima mestruazione.');
      this.persistDates();
    }
  }

  changeView(view: 'full' | 'wheel'): void {
    this.compact.set(view === 'wheel');
    if (this.compact()) this.goToToday();
    document.getElementById('app-menu')?.hidePopover();
  }

  loadExample(): void {
    this.today.set(todayIso());
    this.lmp.set(addDays(this.today(), -143));
    this.dueDate.set(addDays(this.lmp(), 280));
    this.selectedDays.set(143);
    this.error.set('');
    this.example.set(true);
  }

  clear(): void {
    this.lmp.set('');
    this.dueDate.set('');
    this.example.set(false);
    this.selectedDays.set(0);
    this.error.set('');
    this.persistDates();
  }

  private restoreDates(): void {
    try {
      const raw = localStorage.getItem(DATES_STORAGE_KEY);
      if (raw === null) return;
      const dates = parseSavedDates(raw, this.today());
      this.lmp.set(dates.lmp);
      this.dueDate.set(dates.dueDate);
      this.example.set(false);
      const result = calculateGestation(dates.lmp, this.today());
      if (result.ok) this.selectedDays.set(Math.min(result.value.elapsedDays, 294));
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof RangeError) {
        this.storageError.set('Le date salvate non sono valide e non sono state caricate. Inserisci nuove date oppure premi “Cancella” per rimuoverle.');
      } else if (error instanceof DOMException) {
        this.storageError.set('Il browser non consente di leggere le date salvate. Puoi usare la ruota, ma i dati potrebbero non essere ripristinati alla riapertura.');
      } else {
        throw error;
      }
    }
  }

  private persistDates(): void {
    try {
      const value = this.gestation();
      if (value) {
        localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify({ lmp: this.lmp(), dueDate: value.dueDate }));
      } else {
        localStorage.removeItem(DATES_STORAGE_KEY);
      }
      this.storageError.set('');
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      this.storageError.set(this.gestation()
        ? 'Salvataggio sul dispositivo non riuscito. Le date restano disponibili solo fino alla chiusura o al ricaricamento dell’app.'
        : 'Impossibile eliminare le date dal dispositivo. Potrebbero ricomparire alla riapertura: rimuovi i dati del sito dalle impostazioni del browser.');
    }
  }

  selectWeek(week: number): void {
    this.selectedDays.set(Math.min(42, Math.max(0, week)) * 7);
  }

  slide(event: Event): void {
    this.selectWeek(Number((event.target as HTMLInputElement).value));
  }

  goToToday(): void {
    this.refreshToday();
    const value = this.gestation();
    if (value) this.selectedDays.set(Math.min(value.elapsedDays, 294));
  }

  @HostListener('window:online')
  online(): void { this.offline.set(false); }

  @HostListener('window:offline')
  wentOffline(): void { this.offline.set(true); }

  @HostListener('window:focus')
  refreshToday(): void {
    const old = this.gestation();
    const followingToday = old?.elapsedDays === this.selectedDays();
    this.today.set(todayIso());
    const value = this.gestation();
    if (followingToday && value) this.selectedDays.set(Math.min(value.elapsedDays, 294));
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  captureInstall(event: Event): void {
    event.preventDefault();
    this.installPrompt.set(event as InstallPromptEvent);
  }

  @HostListener('window:appinstalled')
  onInstalled(): void {
    this.installed.set(true);
    this.installPrompt.set(null);
    this.installHelp.set(false);
    this.status.set('RuotaGyn è stata installata sul dispositivo.');
  }

  async install(): Promise<void> {
    document.getElementById('app-menu')?.hidePopover();
    const prompt = this.installPrompt();
    if (!prompt) {
      this.installHelp.update((visible) => !visible);
      return;
    }
    this.installBusy.set(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      this.status.set(choice.outcome === 'accepted'
        ? 'Installazione richiesta al browser.'
        : 'Installazione annullata. Puoi continuare a usare RuotaGyn dal browser.');
      this.installPrompt.set(null);
    } catch {
      this.status.set('Impossibile aprire l’installazione. Usa il menu del browser e scegli “Installa app” o “Aggiungi alla schermata Home”.');
      this.installPrompt.set(null);
    } finally {
      this.installBusy.set(false);
    }
  }

  reload(): void { window.location.reload(); }
}
