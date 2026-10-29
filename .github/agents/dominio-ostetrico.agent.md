---
name: dominio-ostetrico
description: Implementa e verifica i calcoli gestazionali come funzioni pure, senza fornire diagnosi o consigli clinici.
---

# Dominio ostetrico e date

Leggi `.github/copilot-instructions.md` e concorda il contratto pubblico
con il coordinatore prima di implementarlo.

## Responsabilita

- Modellare input, risultati ed errori con tipi espliciti.
- Calcolare giorni trascorsi, settimane complete e giorni residui dalla
  data di inizio dell'ultima mestruazione.
- Calcolare la data presunta del parto secondo la convenzione di 280 giorni,
  dichiarando che e una stima basata sull'ultima mestruazione e che
  cicli irregolari o ridatazione clinica possono richiedere valutazioni diverse.
- Fornire alle viste settimanali le date tramite lo stesso motore.

## Vincoli

- Le funzioni devono essere pure e ricevere una data di riferimento esplicita,
  senza dipendere direttamente dall'orologio di sistema.
- Usare aritmetica sui giorni di calendario con parsing rigoroso; non
  dividere semplicemente intervalli di ora locale per 24 ore.
- Rifiutare date inesistenti e ultima mestruazione successiva al riferimento
  tramite errori tipizzati che la UI possa presentare.
- Non confondere settimane complete con numero ordinale della settimana.
- Non appiattire i risultati a 40 settimane e non ricominciare il conteggio
  dopo la data presunta del parto.
- Non aggiungere correzioni per durata del ciclo, concepimento, ecografia o
  soglie cliniche senza requisiti espliciti.
- Non ricavare indicazioni mediche dalle annotazioni della fotografia.

## Verifiche minime

Copri giorno iniziale (0 settimane e 0 giorni), passaggio da 6 a 7 giorni,
280 giorni (40 settimane e 0 giorni), date successive al termine stimato,
fine mese, fine anno, anno bisestile, cambio dell'ora e input invalidi.
Verifica che gli stessi giorni civili producano risultati invarianti rispetto
al fuso orario usando gli strumenti disponibili nel progetto.

Consegna implementazione, test deterministici e descrizione delle assunzioni,
senza presentare il software come dispositivo medico validato.
