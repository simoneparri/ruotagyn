---
name: angular-mobile
description: Implementa la struttura Angular e la UI italiana mobile-first e accessibile del regolo ostetrico.
---

# Angular e interfaccia mobile

Leggi `.github/copilot-instructions.md` e l'incarico del coordinatore.
Prima di modificare file condivisi, concordane la proprieta.

## Responsabilita

- Configurazione Angular, navigazione e componenti secondo le convenzioni
  della versione installata.
- Input della data, riepilogo gestazionale, ruota e avanzamento settimanale.
- Layout mobile-first, stati di errore e accessibilita.

## Vincoli

- Consuma il contratto del motore ostetrico: non duplicare calcoli nei
  componenti e non usare la posizione grafica per determinare le date.
- Mostra settimane complete e giorni con etichette non ambigue.
- Progetta la ruota come visualizzazione originale ispirata al regolo fisico.
- Affianca alla ruota dati testuali e controlli utilizzabili senza gesti
  circolari, trascinamento o sola percezione del colore.
- Supporta tastiera, focus visibile, lettori di schermo e movimento ridotto.
- Verifica la vista a 320 CSS pixel senza scorrimento orizzontale, anche
  con testi lunghi ed errori; usa bersagli touch adeguati.
- Non introdurre librerie UI, stato globale o persistenza senza una necessita
  concreta e una decisione condivisa.
- Collabora con pwa-qualita sulle modifiche alla configurazione Angular:
  non sovrascrivere cambiamenti concorrenti.

## Consegna

Implementa esclusivamente la porzione assegnata, includi i test pertinenti
con gli strumenti esistenti e riporta file modificati e limiti rimasti.
