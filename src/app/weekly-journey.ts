import { REFERENCE_SOURCES, WeeklyReference, formatReference, weeklyReferences } from './weekly-references';

export const JOURNEY_SOURCES = {
  screening: {
    title: 'ISS-SNLG, Gravidanza fisiologica, parte 3 (2026)',
    url: 'https://www.epicentro.iss.it/materno/pdf/convegno-4-marzo-2026/SNLG_1_2026_Gravidanza-fisiologica%20Parte-3.pdf',
    detail: 'Raccomandazioni: ecografie 11+0–13+6 e 19+0–21+0; screening delle trisomie, datazione e monitoraggio della crescita. Il percorso dipende dal contesto e dalla scelta informata.',
  },
  infections: {
    title: 'ISS-SNLG, Gravidanza fisiologica, parte 1 (revisione 2026)',
    url: 'https://www.epicentro.iss.it/itoss/pdf/LG-Gravidanza-Fisiologica-Parte1_protetto.pdf',
    detail: 'Screening delle infezioni; tampone vaginale e rettale per streptococco di gruppo B a 36+0–37+6.',
  },
  nhs: {
    title: 'NHS, guida settimana per settimana',
    url: 'https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/',
    detail: 'Lunghezze embrionali indicative a 4–8 settimane, non percentili né misure personali. Le settimane 4 e 5 riportano entrambe circa 2 mm.',
  },
  bee: {
    title: 'Animal Diversity Web, Apis mellifera',
    url: 'https://animaldiversity.org/accounts/Apis_mellifera/',
    detail: 'Ape operaia: 10–15 mm. Per il gioco si usa un riferimento arrotondato di 12 mm.',
  },
  snail: {
    title: 'Animal Diversity Web, Helix pomatia',
    url: 'https://animaldiversity.org/accounts/Helix_pomatia/',
    detail: 'Guscio adulto: 3,8–5 cm di altezza e diametro. Il gioco usa 4 cm di diametro del guscio, non la lunghezza della chiocciola.',
  },
  mouse: {
    title: 'Animal Diversity Web, Mus musculus',
    url: 'https://animaldiversity.org/accounts/Mus_musculus/',
    detail: 'Corpo adulto: 6,5–9,5 cm, coda esclusa. Per il gioco si usa un riferimento di 8 cm.',
  },
  rodents: {
    title: 'MSD Veterinary Manual, Biological Data of Pet Rodents',
    url: 'https://www.msdvetmanual.com/multimedia/table/biological-data-of-pet-rodents',
    detail: 'Criceto siriano maschio: 85–140 g. Riferimento ludico scelto nell’intervallo: 110 g.',
  },
  squirrel: {
    title: 'Animal Diversity Web, Sciurus vulgaris',
    url: 'https://animaldiversity.org/accounts/Sciurus_vulgaris/',
    detail: 'Scoiattolo rosso: massa media riportata di 600 g, usata come riferimento ludico. Non descrive ogni individuo.',
  },
  pets: {
    title: 'Becker et al., 2025, pesi degli animali da compagnia',
    url: 'https://doi.org/10.1371/journal.pone.0318734',
    detail: 'Medie di popolazione nel Regno Unito: porcellino d’India circa 1 kg, coniglio 2,3 kg, gatto 4,2 kg. Non descrivono ogni animale o razza.',
  },
} as const;

type Source = { readonly title: string; readonly url: string; readonly detail: string };

export interface JourneyEvent {
  readonly id: string;
  readonly title: string;
  readonly window: string;
  readonly firstDay: number;
  readonly lastDay: number;
  readonly text: string;
  readonly source: Source;
}

export const JOURNEY_EVENTS: readonly JourneyEvent[] = [
  {
    id: 'first-ultrasound', title: 'Ecografia del primo trimestre', window: '11+0–13+6',
    firstDay: 77, lastDay: 97,
    text: 'Valuta datazione e anatomia precoce. È distinta dai test di screening delle trisomie.',
    source: JOURNEY_SOURCES.screening,
  },
  {
    id: 'combined', title: 'Test combinato', window: '11+0–13+6',
    firstDay: 77, lastDay: 97,
    text: 'Combina translucenza nucale, hCG e PAPP-A per stimare una probabilità, non per fare diagnosi. Le linee guida prevedono il DNA fetale da 10+0 dove disponibili risorse e strutture accreditate; altrimenti il combinato come screening primario. Scelta e percorso si discutono nella consulenza.',
    source: JOURNEY_SOURCES.screening,
  },
  {
    id: 'morphology', title: 'Ecografia morfologica', window: '19+0–21+0',
    firstDay: 133, lastDay: 147,
    text: 'Studia l’anatomia fetale secondo un protocollo definito. Il limite della finestra è 21+0, non tutta la settimana 21. Non esclude ogni possibile anomalia.',
    source: JOURNEY_SOURCES.screening,
  },
  {
    id: 'fundal-height', title: 'Monitoraggio della crescita', window: 'Da 24+0, ai bilanci di salute',
    firstDay: 168, lastDay: 294,
    text: 'La misura fondo-sinfisi fa parte della valutazione della crescita. L’ecografia nel terzo trimestre non è prevista di routine nella gravidanza fisiologica, ma su indicazione clinica.',
    source: JOURNEY_SOURCES.screening,
  },
  {
    id: 'gbs', title: 'Tampone per streptococco di gruppo B', window: '36+0–37+6',
    firstDay: 252, lastDay: 265,
    text: 'Il campione vaginale e rettale ricerca la colonizzazione da streptococco di gruppo B. Modalità ed esito si discutono con il professionista.',
    source: JOURNEY_SOURCES.infections,
  },
];

const WEEKLY_FOCUS: readonly string[] = [
  'Il conteggio parte dall’ultima mestruazione, non dal concepimento.',
  'Le prime settimane sono convenzionali: il concepimento non è ancora presupposto.',
  'Il giorno del concepimento non si ricava con certezza dalla ruota.',
  'L’età gestazionale non è la stessa cosa dell’età dal concepimento.',
  'Le dimensioni iniziali sono piccolissime: i valori indicativi non confermano una gravidanza.',
  'La stessa misura arrotondata può comparire in settimane diverse: non è una curva di crescita personale.',
  'Il calendario aiuta a orientarsi, ma non stabilisce quando un singolo esame sia interpretabile.',
  'La lunghezza dalla testa al fondo del tronco non comprende le gambe.',
  'Le dimensioni illustrative non sostituiscono le misure ecografiche.',
  'La CRL è la lunghezza cranio-caudale: dalla testa al sacro, non ai piedi.',
  'È il momento del percorso informativo sugli screening: il DNA fetale è previsto da 10+0 nei contesti indicati dalle linee guida.',
  'Si apre la finestra dell’ecografia del primo trimestre e del test combinato.',
  'Screening e diagnosi sono diversi: una probabilità non è una diagnosi.',
  'La finestra del primo trimestre arriva a 13+6: il calendario non prenota né prescrive esami.',
  'Da qui mostriamo il peso fetale di riferimento; non è una misura del tuo bambino.',
  'Il peso stimato e la lunghezza sono grandezze diverse: non vanno confrontati direttamente.',
  'Il 50° percentile è la mediana della popolazione studiata, non un obiettivo.',
  'Le misure della testa, dell’addome e del femore descrivono aspetti diversi della crescita.',
  'La morfologica ha una finestra definita: nel calendario qui riportato inizia a 19+0.',
  'Si apre la finestra dell’ecografia morfologica, dedicata all’anatomia fetale.',
  'La morfologica studia l’anatomia; il peso da solo non descrive lo sviluppo.',
  'La finestra ISS della morfologica termina a 21+0, non a 21+6.',
  'Una singola misura non permette di valutare da sola l’andamento della crescita.',
  'Le tabelle sono riferimenti di popolazione: il contesto clinico resta essenziale.',
  'Da 24+0 la misura fondo-sinfisi rientra nei bilanci di salute per la crescita.',
  'Il monitoraggio della crescita non significa necessariamente fare un’ecografia ogni settimana.',
  'Confrontare settimane diverse nella tabella non equivale a seguire la crescita individuale.',
  'I paragoni con gli animali riguardano il peso, non forma o lunghezza del feto.',
  'Inizia il terzo trimestre secondo gli intervalli usati da questa ruota.',
  'Un valore diverso dalla mediana non è, da solo, indice di un problema.',
  'Nel terzo trimestre l’ecografia viene proposta su indicazione clinica, non di routine.',
  'Le dimensioni del feto non si deducono dalle dimensioni dell’animale illustrato.',
  'Il peso è una stima statistica: l’app non elabora referti o diagnosi.',
  'Ogni bilancio di salute considera più informazioni, non soltanto un numero.',
  'Il calendario non aggiunge esami automatici: il percorso resta concordato con chi ti segue.',
  'La finestra del tampone per streptococco di gruppo B inizia a 36+0.',
  'Si apre la finestra del tampone vaginale e rettale per streptococco di gruppo B.',
  'La finestra del tampone qui riportata arriva a 37+6.',
  'La data presunta del parto è una stima, non un appuntamento certo.',
  'Il calendario non può prevedere il giorno della nascita.',
  '40+0 è il riferimento convenzionale della data presunta del parto.',
  'Oltre la data presunta, controlli e tempi si concordano con il punto nascita: la ruota non li decide.',
  'Il limite grafico a 42 settimane non è una soglia di sicurezza: la gestione richiede il professionista.',
];

export interface JourneySize {
  readonly value: number;
  readonly unit: 'cm' | 'g';
  readonly label: string;
  readonly formatted: string;
  readonly age: string;
  readonly note: string;
  readonly source: Source;
}

interface AnimalComparison {
  readonly emoji: string;
  readonly label: string;
  readonly basis: string;
  readonly referenceValue: number;
  readonly unit: 'cm' | 'g';
  readonly source: Source;
}

function referenceSize(reference: WeeklyReference): JourneySize {
  if (reference.value === null || reference.referenceAge === null ||
      (reference.unit !== 'cm' && reference.unit !== 'g')) {
    throw new Error('Misura settimanale non disponibile.');
  }
  const source = REFERENCE_SOURCES.find((item) => item.id === reference.sourceId);
  if (!source) throw new Error('Fonte della misura mancante.');
  return {
    value: reference.value, unit: reference.unit, label: reference.label,
    formatted: formatReference(reference), age: reference.referenceAge,
    note: 'Mediana (50° percentile) a settimana +0, non una misura personale né un obiettivo di crescita.',
    source,
  };
}

function animalFor(week: number): AnimalComparison {
  if (week <= 8) return { emoji: '🐝', label: 'Ape operaia', basis: 'lunghezza del corpo', referenceValue: 1.2, unit: 'cm', source: JOURNEY_SOURCES.bee };
  if (week <= 11) return { emoji: '🐌', label: 'Chiocciola', basis: 'diametro del guscio, non corpo', referenceValue: 4, unit: 'cm', source: JOURNEY_SOURCES.snail };
  if (week <= 13) return { emoji: '🐁', label: 'Topolino', basis: 'lunghezza del corpo, coda esclusa', referenceValue: 8, unit: 'cm', source: JOURNEY_SOURCES.mouse };
  if (week <= 17) return { emoji: '🐹', label: 'Criceto siriano', basis: 'peso', referenceValue: 110, unit: 'g', source: JOURNEY_SOURCES.rodents };
  if (week <= 23) return { emoji: '🐿️', label: 'Scoiattolo rosso', basis: 'peso', referenceValue: 600, unit: 'g', source: JOURNEY_SOURCES.squirrel };
  if (week <= 29) return { emoji: '🐹', label: 'Porcellino d’India', basis: 'peso; emoji di un piccolo roditore', referenceValue: 1000, unit: 'g', source: JOURNEY_SOURCES.pets };
  if (week <= 37) return { emoji: '🐇', label: 'Coniglio', basis: 'peso', referenceValue: 2300, unit: 'g', source: JOURNEY_SOURCES.pets };
  return { emoji: '🐈', label: 'Gatto domestico', basis: 'peso', referenceValue: 4200, unit: 'g', source: JOURNEY_SOURCES.pets };
}

export function weeklyJourney(week: number) {
  const references = weeklyReferences(week);
  let size: JourneySize | null = null;
  if (week >= 4 && week <= 8) {
    const value = [0.2, 0.2, 0.6, 1, 1.6][week - 4];
    size = {
      value, unit: 'cm', label: 'Lunghezza embrionale indicativa',
      formatted: `${new Intl.NumberFormat('it-IT').format(value)} cm`, age: `Circa ${week} settimane`,
      note: 'Valore illustrativo NHS, non mediana a +0. Dalla settimana 7 la fonte specifica testa-fondo del tronco.',
      source: { ...JOURNEY_SOURCES.nhs, url: `${JOURNEY_SOURCES.nhs.url}1st-trimester/week-${week}/` },
    };
  } else {
    const reference = references.find((item) => item.id === (week < 14 ? 'crl' : 'efw'));
    if (reference && reference.value !== null) size = referenceSize(reference);
  }
  const animal = size ? animalFor(week) : null;
  if (size && animal && size.unit !== animal.unit) throw new Error('Dimensioni del paragone incompatibili.');
  return {
    week, focus: WEEKLY_FOCUS[week],
    events: JOURNEY_EVENTS.filter((event) => week * 7 <= event.lastDay && week * 7 + 6 >= event.firstDay),
    size,
    animal: size && animal ? {
      ...animal,
      percentage: new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 0 }).format(size.value / animal.referenceValue),
    } : null,
    unavailable: week < 4
      ? 'In queste settimane non mostriamo una misura embrionale né un paragone animale: il conteggio parte prima del concepimento convenzionale.'
      : 'Le tabelle di crescita qui utilizzate terminano a 40+0. Non estrapoliamo misure o paragoni per 41 e 42 settimane.',
  };
}
