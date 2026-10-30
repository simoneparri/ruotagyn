export interface ReferenceSource {
  id: string;
  title: string;
  url: string;
  detail: string;
  links: readonly { label: string; url: string }[];
}

export interface WeeklyReference {
  id: string;
  label: string;
  shortLabel: string;
  unit: string;
  value: number | null;
  decimals: number;
  sourceId: string | null;
  referenceAge: string | null;
  note: string;
}

export const REFERENCE_SOURCES: readonly ReferenceSource[] = [
  {
    id: 'who',
    title: 'WHO — Kiserud et al., 2017',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5261648/',
    detail: 'Peso fetale stimato indipendente dal sesso, DBP, CC, CA, femore e omero: 50° percentile delle tabelle 6–11, da 14+0 a 40+0. Lunghezze convertite da mm a cm. Il DBP usa la misura esterno-interno. Studio su gravidanze singole; i riferimenti variano anche fra popolazioni. Dati da articolo con licenza CC BY.',
    links: [
      { label: 'Tabelle 6–11 e metodologia', url: 'https://doi.org/10.1371/journal.pmed.1002220' },
    ],
  },
  {
    id: 'fmf',
    title: 'Fetal Medicine Foundation — Ciobanu et al., 2019',
    url: 'https://doi.org/10.1002/uog.20157',
    detail: 'Indice di pulsatilità (PI), senza unità, delle arterie ombelicale e cerebrale media: mediane della tabella 2. Ogni riga rappresenta la settimana +3 giorni (143, 150, …, 290 giorni), da 20+3 a 41+3, non il giorno +0 delle altre tabelle. Modelli di riferimento su una popolazione non selezionata, con misure raccolte in quattro finestre gestazionali; non sono soglie diagnostiche né correzioni per caratteristiche individuali.',
    links: [
      { label: 'Articolo completo e tabella 2 (PDF)', url: 'https://amzn-fmf-bucket.s3.eu-west-2.amazonaws.com/research-publications/1156.pdf' },
      { label: 'Scheda PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/30353583/' },
    ],
  },
  {
    id: 'crl',
    title: 'INTERGROWTH-21st — Papageorghiou et al., 2014',
    url: 'https://intergrowth21.com/tools-resources/fetal-size-early-pregnancy',
    detail: 'CRL: 50° percentile della tabella ufficiale, convertito da mm a cm. Mostrato soltanto a 9+0, 10+0, 11+0, 12+0, 13+0 e 14+0, entro i limiti raccomandati nella policy di ottobre 2025. Non viene esteso alle settimane successive.',
    links: [
      { label: 'Tabella CRL (PDF)', url: 'https://intergrowth21.com/sites/default/files/2023-01/grow_early_preg_charts_size_ct_table.pdf' },
      { label: 'Limiti gestazionali, ottobre 2025 (PDF)', url: 'https://intergrowth21.com/sites/default/files/2025-10/policy_on_gestational_age_limits_for_fetal_growth_standards_7.pdf' },
    ],
  },
  {
    id: 'gwg',
    title: 'INTERGROWTH-21st — Cheikh Ismail et al., 2016',
    url: 'https://doi.org/10.1136/bmj.i555',
    detail: 'Variazione del peso materno: 50° percentile da 15+0 a 40+0, rispetto al peso misurato alla visita del primo trimestre (9–13+6), non rispetto al peso prima della gravidanza. Popolazione sana con BMI iniziale 18,50–24,99. È una descrizione statistica di quella popolazione, non un aumento consigliato o un obiettivo personale; non si applica automaticamente ad altri BMI.',
    links: [
      { label: 'Tabella del peso materno (PDF)', url: 'https://intergrowth21.com/sites/default/files/2023-01/grow_gwg-nw-ct_table.pdf' },
      { label: 'Risorse ufficiali', url: 'https://intergrowth21.com/tools-resources/gestational-weight-gain' },
    ],
  },
];

// WHO, tabelle 6–11: colonna P50, settimane esatte 14–40; mm salvo il peso in g.
const WHO_MEDIANS = {
  bpd: [27, 30, 33, 36, 40, 43, 47, 50, 53, 57, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 85, 87, 89, 90, 92, 94, 96],
  hc: [100, 111, 123, 135, 148, 161, 173, 186, 198, 210, 222, 233, 244, 254, 264, 273, 281, 289, 296, 303, 309, 315, 321, 326, 332, 337, 342],
  ac: [81, 92, 103, 114, 126, 138, 150, 162, 173, 185, 197, 208, 219, 230, 240, 250, 260, 269, 279, 288, 298, 307, 317, 328, 338, 350, 363],
  fl: [13, 16, 19, 22, 26, 29, 32, 35, 38, 41, 43, 46, 48, 50, 52, 54, 56, 59, 61, 63, 65, 67, 69, 70, 72, 73, 73],
  hl: [14, 16, 19, 23, 26, 28, 31, 34, 36, 38, 41, 42, 44, 46, 48, 49, 51, 53, 54, 56, 58, 59, 61, 62, 63, 64, 64],
  efw: [90, 114, 144, 179, 222, 272, 330, 398, 476, 565, 665, 778, 902, 1039, 1189, 1350, 1523, 1707, 1901, 2103, 2312, 2527, 2745, 2966, 3186, 3403, 3617],
} as const;

// FMF, tabella 2: mediane a settimana +3, non a settimana +0.
const UMBILICAL_PI = [1.218, 1.197, 1.176, 1.155, 1.134, 1.113, 1.092, 1.070, 1.049, 1.028, 1.007, 0.986, 0.965, 0.944, 0.923, 0.902, 0.881, 0.860, 0.839, 0.818, 0.797, 0.776];
const CEREBRAL_PI = [1.486, 1.540, 1.595, 1.651, 1.705, 1.757, 1.805, 1.848, 1.883, 1.909, 1.924, 1.926, 1.915, 1.889, 1.848, 1.791, 1.718, 1.632, 1.532, 1.421, 1.302, 1.177];
const CRL_MM = [21.9, 32.6, 43.8, 55.6, 67.8, 80.6];
const MATERNAL_GAIN_KG = [0.4, 1.0, 1.6, 2.2, 2.8, 3.3, 3.8, 4.4, 4.9, 5.4, 5.9, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.1, 11.6, 12.1, 12.6, 13.2, 13.7];

function tableValue(values: readonly number[], firstWeek: number, week: number, divisor = 1): number | null {
  const value = values[week - firstWeek];
  return value === undefined ? null : value / divisor;
}

export function weeklyReferences(week: number): readonly WeeklyReference[] {
  if (!Number.isInteger(week) || week < 0 || week > 42) {
    throw new RangeError('Seleziona una settimana intera fra 0 e 42.');
  }
  const who = (id: keyof typeof WHO_MEDIANS, label: string, shortLabel: string): WeeklyReference => ({
    id, label, shortLabel, unit: id === 'efw' ? 'g' : 'cm',
    value: tableValue(WHO_MEDIANS[id], 14, week, id === 'efw' ? 1 : 10),
    decimals: id === 'efw' ? 0 : 1, sourceId: 'who',
    referenceAge: week >= 14 && week <= 40 ? `${week}+0` : null,
    note: 'Riferimenti disponibili da 14+0 a 40+0. Nessuna estrapolazione.',
  });
  const doppler = (id: string, label: string, shortLabel: string, values: readonly number[]): WeeklyReference => ({
    id, label, shortLabel, unit: '', value: tableValue(values, 20, week),
    decimals: 3, sourceId: 'fmf',
    referenceAge: week >= 20 && week <= 41 ? `${week}+3` : null,
    note: 'Mediana della riga a settimana +3 giorni, disponibile da 20+3 a 41+3; non è un limite di normalità.',
  });
  return [
    doppler('ua-pi', 'Arteria ombelicale — indice di pulsatilità', 'PI ombelicale', UMBILICAL_PI),
    doppler('mca-pi', 'Arteria cerebrale media — indice di pulsatilità', 'PI cerebrale', CEREBRAL_PI),
    {
      id: 'gwg', label: 'Variazione del peso materno', shortLabel: 'Peso materno*',
      unit: 'kg', value: tableValue(MATERNAL_GAIN_KG, 15, week), decimals: 1, sourceId: 'gwg',
      referenceAge: week >= 15 && week <= 40 ? `${week}+0` : null,
      note: 'Solo popolazione con BMI iniziale 18,50–24,99; variazione dalla visita del primo trimestre, non un obiettivo personale. Tabella da 15+0 a 40+0.',
    },
    who('efw', 'Peso fetale stimato', 'Peso fetale'),
    {
      id: 'crl', label: 'Lunghezza cranio-caudale — CRL', shortLabel: 'CRL',
      unit: 'cm', value: tableValue(CRL_MM, 9, week, 10), decimals: 2, sourceId: 'crl',
      referenceAge: week >= 9 && week <= 14 ? `${week}+0` : null,
      note: 'Riferimenti mostrati da 9+0 a 14+0, nei limiti raccomandati dalla fonte.',
    },
    who('bpd', 'Diametro biparietale — DBP (esterno-interno)', 'DBP'),
    {
      id: 'tad', label: 'Diametro addominale trasverso — DAT', shortLabel: 'DAT',
      unit: 'cm', value: null, decimals: 1, sourceId: null, referenceAge: null,
      note: 'Non disponibile: nessuna tabella adeguata verificata per questa pagina. Non viene ricavato dalla circonferenza addominale.',
    },
    who('ac', 'Circonferenza addominale — CA', 'CA'),
    who('hc', 'Circonferenza cranica — CC', 'CC'),
    who('fl', 'Lunghezza del femore', 'Femore'),
    who('hl', 'Lunghezza dell’omero', 'Omero'),
  ];
}

export function formatReference(reference: WeeklyReference): string {
  if (reference.value === null) return 'Non disponibile';
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: reference.decimals,
    maximumFractionDigits: reference.decimals,
  }).format(reference.value) + (reference.unit ? ` ${reference.unit}` : '');
}
