# RuotaGyn

## Obiettivo confermato

Creare un'applicazione Angular mobile-friendly di tipo PWA: un regolo
ostetrico che, dalla data di inizio dell'ultima mestruazione, mostra eta
gestazionale, data presunta del parto e avanzamento settimana per settimana.
Interfaccia e messaggi sono in italiano.

La cartella iniziale contiene `immagine.jpeg`, fotografia di un regolo
ostetrico fisico. Usarla come riferimento concettuale per la ruota, non come
fonte clinica; non riprodurre pubblicita, confezioni o marchi presenti.
Al momento della creazione del team non esistono ancora sorgenti Angular.

## Team

Le definizioni persistenti sono in `.github/agents/`:

| Agente | Responsabilita |
| --- | --- |
| coordinatore | Backlog, decisioni condivise, assegnazioni e integrazione |
| angular-mobile | Struttura Angular, interfaccia responsive e accessibilita |
| dominio-ostetrico | Calcoli gestazionali, validazione e test delle date |
| pwa-qualita | Installazione, offline, aggiornamenti e verifica integrata |

Il coordinatore assegna attivita delimitate. Parallelizzare solo lavori
indipendenti con file distinti; concordare i contratti prima di iniziare.
Questi file definiscono agenti selezionabili, non processi sempre attivi.
Non presumere che l'ambiente possa avviare automaticamente altri agenti.

## Perimetro iniziale

- Inserimento della data di inizio dell'ultima mestruazione.
- Eta gestazionale in settimane complete e giorni rispetto alla data corrente.
- Data presunta del parto stimata e avanzamento settimanale.
- Ruota leggibile su mobile, accompagnata da una rappresentazione testuale.
- Installabilita PWA e disponibilita offline dopo il primo caricamento.
- Indicazione esplicita che le stime non sostituiscono la valutazione clinica.

Prima di implementare scelte che cambiano significativamente il prodotto,
chiedere conferma su pubblico destinatario, persistenza dei dati e contenuti
clinici aggiuntivi. Login, backend, sincronizzazione, notifiche, referti e
consigli personalizzati non sono requisiti confermati.

## Regole condivise

Persistenza autorizzata: ultima mestruazione e data presunta del parto sono
salvate nel localStorage del browser e ripristinate all'avvio, con validazione.
Il pulsante Cancella rimuove il salvataggio. Nessun invio a server o cache sanitaria.

- Separare calcoli puri TypeScript da componenti e persistenza.
- Trattare le date ostetriche come giorni di calendario, evitando errori
  introdotti da fuso orario e cambio dell'ora.
- Mostrare errori comprensibili per date invalide o incoerenti; non correggere
  silenziosamente gli input.
- Non registrare dati sanitari in log, analytics o servizi esterni.
- Non introdurre salvataggi persistenti di dati sanitari senza una decisione
  esplicita; non inserirli nelle cache del service worker.
- Non trasformare le annotazioni della fotografia in raccomandazioni mediche.
- Non introdurre tabelle di crescita o calendari di esami senza fonti
  autorevoli verificate e requisiti concordati.
- Riutilizzare strumenti e convenzioni del progetto quando saranno presenti.
- Ogni consegna distingue lavoro completato, verifiche eseguite e blocchi.
