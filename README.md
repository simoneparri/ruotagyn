# RuotaGyn

Regolo ostetrico digitale Angular, mobile-first e PWA, con interfaccia italiana.
La ruota digitale non contiene pubblicita o marchi.
Non e un dispositivo medico validato.

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
le dipendenze o gli altri file di progetto.
Il server di anteprima e solo per uso locale.

## Tipografia

La scala dei caratteri e centralizzata in `src/styles.css`: `--font-scale`
vale `1.38` (aumento del 15% seguito da un ulteriore 20%). I CSS dei componenti
usano i token condivisi `--font-*` in rem, anche per le etichette SVG della ruota.
Per cambiare tutte le dimensioni basta modificare `--font-scale`; per una singola
dimensione si modifica il relativo token. Spaziature e dimensioni dei contenitori
non vengono scalate.

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
- Pagina del regolo con step 1 a tutta larghezza sopra la ruota, senza barra
  laterale e senza riquadro Il tuo percorso. Titolo, campi data e azioni sono
  affiancati su desktop e si dispongono su piu righe sugli schermi piccoli.
- Intestazione sempre visibile durante lo scorrimento su desktop e mobile,
  senza pulsanti di navigazione duplicati sotto l'header.
- Menu hamburger nell'intestazione con navigazione fra le due pagine e installazione
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
  Mostra la ruota, il comando di uscita e le quattro date delle lancette:
  a destra su desktop e in orizzontale, in quattro colonne su una sola riga
  sotto la ruota su mobile portrait. Le date si aggiornano durante la rotazione.
  La ruota si adatta allo spazio disponibile senza scroll.
  Uscita tramite Esci o Escape,
  con ritorno del focus al pulsante iniziale. Non nasconde le barre del browser.
- Quattro lancette radiali a freccia, senza pallini numerati, con etichette e date anche in formato
  testuale: ultima mestruazione, concepimento stimato (+14 giorni),
  mestruazione mancata stimata (+28 giorni) e parto presunto (+280 giorni).
  Sulle lancette le etichette sono abbreviate su una sola riga; la legenda
  e i titoli accessibili mantengono le descrizioni complete.
  Ultima mestruazione, concepimento e ritardo stimato si ribaltano insieme,
  seguendo il verso dell'ultima mestruazione; il parto mantiene un verso indipendente.
  La legenda sotto la ruota usa pallini senza numeri degli stessi colori
  delle lancette e include anche la legenda dei trimestri, sempre visibile.
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
- Istruzioni di trascinamento e tastiera nell'accordion Accessibilita e comandi,
  chiuso inizialmente e apribile da tastiera. Trimestri e lettura degli anelli
  sono nella legenda insieme ai riferimenti delle lancette.
- Esplorazione settimanale senza modificare le date inserite.
  Accanto alla settimana selezionata compare il trimestre (0-13, 14-27,
  28-42 settimane), con lo stesso colore del relativo settore della ruota.
- In **Una settimana alla volta**, scheda informativa per tutte le settimane 0-42:
  focus settimanale, finestre di alcuni esami e controlli, dimensioni di riferimento
  e paragoni animali con emoji. Le finestre ISS-SNLG sono indicate esattamente:
  ecografia del primo trimestre e test combinato 11+0-13+6, morfologica
  19+0-21+0 (non 21+6), misura fondo-sinfisi ai bilanci da 24+0, tampone
  per streptococco B 36+0-37+6. Il percorso di screening considera anche
  il DNA fetale da 10+0 nei contesti previsti dalle linee guida 2026.
  Non e un calendario completo o personalizzato: le finestre interessano
  la settimana selezionata, non prescrivono un esame nel giorno visualizzato.
  Lunghezze indicative NHS a 4-8 settimane, CRL INTERGROWTH-21st a 9-13
  e peso fetale P50 WHO a 14-40; nessuna estrapolazione a 0-3 o 41-42.
  I paragoni ludici dichiarano dimensione, riferimento animale e percentuale
  approssimativa del riferimento, arrotondata all'intero e calcolata sui valori
  originali: lunghezza e peso non sono confusi. Da 18 a 23 settimane
  il paragone e lo scoiattolo rosso, con riferimento di peso di 600 g.
  Fonti zoologiche ADW,
  MSD Veterinary Manual e Becker et al. (2025), con link e limiti
  soltanto nell'accordion inizialmente chiuso, senza link ripetuti nelle schede.
  Le note sulle misure di riferimento e sui limiti del calendario e dei paragoni animali sono tooltip
  apribili con mouse, focus da tastiera o tocco, chiudibili con Escape
  o clic esterno.
  I contenuti sono statici e disponibili
  offline; i link esterni richiedono rete. Nessuna nuova persistenza o richiesta
  a servizi esterni al cambio di settimana.
- Seconda pagina **Ruota delle settimane**, accessibile dal
  menu, anche tramite `#settimane` (compatibile con GitHub Pages e offline).
  Gira soltanto l'anello esterno 0-42, con settori settimanali alternati lilla e
  pesca, centro fisso, trascinamento, tastiera,
  cursore e pulsanti. La selezione e indipendente dalle date personali e non
  viene salvata. Tabella testuale e fonti con link sono sotto la ruota.
  Le fonti sono in un accordion inizialmente chiuso, apribile anche da tastiera;
  i link dalla tabella aprono l'accordion sulla fonte corrispondente.
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

## Riferimenti della ruota delle settimane

I valori sono mediane statistiche delle popolazioni studiate, non misure
personali, obiettivi o soglie diagnostiche. Tutte le voci indicano la fonte,
l'eta esatta di riferimento e i limiti. Nessuna interpolazione o estrapolazione.
Il modulo puro `src/app/weekly-references.ts` contiene i dati e i metadati
bibliografici; il componente non accede al localStorage e non invia dati.

- [WHO, Kiserud et al. 2017](https://doi.org/10.1371/journal.pmed.1002220),
  tabelle 6-11, P50 a 14+0-40+0: peso fetale indipendente dal sesso, DBP
  esterno-interno, CC, CA, femore e omero. Misure da mm a cm; peso in g.
  Dati da articolo CC BY con attribuzione.
- [FMF, Ciobanu et al. 2019](https://doi.org/10.1002/uog.20157),
  tabella 2: mediane PI ombelicale e cerebrale media a 20+3-41+3.
  Le righe sono a settimana +3 (143-290 giorni), non a +0: la differenza
  e esplicita nella pagina e nella tabella. Non vengono calcolati rischi,
  percentili individuali o soglie.
- [INTERGROWTH-21st, CRL](https://intergrowth21.com/tools-resources/fetal-size-early-pregnancy):
  P50 a settimane esatte 9+0-14+0; conversione mm-cm e limite raccomandato
  dalla policy di ottobre 2025, anche se la tabella originale e piu ampia.
- [INTERGROWTH-21st, peso materno](https://doi.org/10.1136/bmj.i555):
  P50 a 15+0-40+0, solo popolazione con BMI iniziale 18,50-24,99.
  Variazione dalla visita del primo trimestre (9-13+6), non dal peso
  pregravidico, e non un aumento consigliato.
- DAT: voce presente ma non disponibile, in assenza di tabella adeguata
  verificata. Non si ricava dalla circonferenza addominale.

I link esterni richiedono
connessione; dati e descrizioni sono inclusi nelle risorse statiche offline.

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
