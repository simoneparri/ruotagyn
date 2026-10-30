# RuotaGyn

Regolo ostetrico digitale Angular, mobile-first e PWA, con interfaccia italiana.
La ruota originale riprende il concetto del regolo nella fotografia, senza
pubblicita o marchi. Non e un dispositivo medico validato.

## Avvio

Richiede Node.js `^22.22.3`, `^24.15.0` oppure `>=26` e npm.

```sh
npm ci
npm start
```

Il server di sviluppo e disponibile su `http://127.0.0.1:4200`.
Per la versione PWA con service worker:

```sh
npm run build
npm run preview
```

Aprire `http://127.0.0.1:4173`. In distribuzione servire il contenuto di
`dist/ruotagyn/browser` tramite HTTPS alla radice del dominio. Non distribuire
la fotografia, le dipendenze o gli altri file di progetto.
Il server di anteprima e solo per uso locale.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/deploy.yml` esegue test e build e pubblica
automaticamente l'app su `https://simoneparri.github.io/ruotagyn/` a ogni push
sul branch `main`. E possibile avviare la stessa procedura manualmente dalla
scheda Actions del repository.

Per abilitare la pubblicazione, nelle impostazioni del repository aprire
**Settings > Pages** e selezionare **GitHub Actions** come sorgente di build.
Il workflow usa il percorso `/ruotagyn/` come base dell'app, coerente con il
nome del repository.

## Funzioni e trattamento dei dati

- Ultima mestruazione, eta gestazionale di oggi in settimane complete e giorni.
- Pagina unica con step 1 a tutta larghezza sopra la ruota, senza barra
  laterale e senza riquadro Il tuo percorso. Titolo, campi data e azioni sono
  affiancati su desktop e si dispongono su piu righe sugli schermi piccoli.
- Menu hamburger nell'intestazione con installazione
  sul dispositivo; chiusura con Escape, clic esterno o selezione di un'azione.
  Il menu si apre sotto il pulsante, con il bordo destro allineato anche su mobile.
- Campi ultima mestruazione e parto presunto modificabili:
  l'ultimo campo modificato ricalcola l'altro a distanza di 280 giorni.
  La data mestruale ricavata dal parto e convenzionale, non un dato accertato.
  Rotazione, date e lancette rimangono sincronizzate.
- Data presunta del parto a 280 giorni, senza correzioni per durata del ciclo.
- Ruota con giorni, mesi effettivi e settimane 0-42, cursore e pulsanti accessibili.
- Pulsante Tutto schermo: apre la ruota interattiva in una modale che occupa
  l'intera area del browser, anche su mobile, senza scroll verticale.
  Mostra solo la ruota e il comando di uscita, senza informazioni sottostanti;
  la ruota si adatta anche agli schermi in orizzontale.
  Uscita tramite Esci o Escape,
  con ritorno del focus al pulsante iniziale. Non nasconde le barre del browser.
- Quattro lancette radiali numerate con etichette e date anche in formato
  testuale: ultima mestruazione, concepimento stimato (+14 giorni),
  mestruazione mancata stimata (+28 giorni) e parto presunto (+280 giorni).
  Concepimento e mestruazione mancata sono riferimenti convenzionali per un
  ciclo di 28 giorni, non eventi accertati; possono variare con il ciclo.
  Le lancette e le date si aggiornano insieme durante la rotazione.
- Ruota trascinabile con mouse, dito o penna: senso orario per spostare l'ultima
  mestruazione in avanti, antiorario per arretrarla. Settimane e parto presunto
  si aggiornano durante il gesto. Il calendario esterno resta fermo durante
  la rotazione; il puntatore di oggi resta allineato alla data corrente.
- Ruota utilizzabile anche da tastiera: frecce per un giorno, Pagina su/giu
  per sette giorni. Il campo data resta un'alternativa al trascinamento.
  Le date sono limitate al periodo dal 1 gennaio 1900 a oggi, con avviso al limite.
- Istruzioni di trascinamento e tastiera nell'accordion Accessibilita e comandi;
  trimestri e lettura degli anelli nell'accordion Legenda. Entrambi sono chiusi
  inizialmente e apribili da tastiera.
- Esplorazione settimanale senza modificare le date inserite.
- Installazione nei browser compatibili e uso offline dopo il primo caricamento
  completo della versione di produzione.
- Modale accessibile quando una nuova versione PWA e pronta, con Ricarica ora
  e Piu tardi (anche Escape). Nessuna ricarica automatica; date salvate ripristinate.
  Controlli del service worker all'avvio e ogni 15 minuti mentre l'app e aperta
  e online. Il rilevamento richiede una build di produzione con service worker.

L'app si apre su un **esempio dichiarato**, non su dati reali. Le date inserite
vengono salvate automaticamente nel localStorage del browser con la chiave
`ruotagyn.dates.v1` (ultima mestruazione e parto presunto) e ripristinate alla
riapertura dopo validazione. Non ci sono account, backend, analytics o cookie.
I dati sono accessibili a chi usa lo stesso profilo del browser: non e un
backup ne una sincronizzazione fra dispositivi. Il browser puo eliminarli.
Il pulsante Cancella, gli input invalidi e i campi svuotati rimuovono il
salvataggio precedente. L'esempio non viene salvato e non sovrascrive i dati
personali memorizzati. Gli errori di lettura, scrittura o rimozione sono
segnalati esplicitamente; il resto della ruota rimane utilizzabile.
La cache del service worker contiene soltanto risorse statiche.
Le icone e i caratteri non richiedono servizi esterni.

I risultati sono stime informative, non indicazioni cliniche. Cicli irregolari
e ridatazione ecografica possono modificare la stima; rivolgersi al professionista
che segue la gravidanza. Il conteggio non si azzera oltre la data presunta e
prosegue anche oltre l'intervallo grafico della ruota.

## Verifiche

```sh
npm test
npm run build
npm run test:e2e
```

I test browser usano Google Chrome in `/usr/bin/google-chrome`; impostare
`CHROME_BIN` per un percorso differente. Playwright avvia automaticamente il
server di anteprima della build. I test coprono flussi, errori, layout da
320 a 1280 pixel e riapertura offline con il service worker reale.
Per verificare le date in altri fusi:

```sh
TZ=America/New_York npm test
TZ=Pacific/Auckland npm test
```

Le icone PNG sono incluse; per rigenerarle usare
`python3 scripts/generate-icons.py` con Pillow disponibile.

## Team

Le definizioni dei quattro agenti sono in `.github/agents/`;
le regole condivise sono in `.github/copilot-instructions.md`.
