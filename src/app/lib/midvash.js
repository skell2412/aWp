const BASE_URL = 'https://api.midvash.com/v1';

// Mapeo amigable de libros comunes en español a los slugs que espera la API
const LIBROS_ES = {
  genesis: 'genesis',
  exodo: 'exodus',
  levitico: 'leviticus',
  numeros: 'numbers',
  deuteronomio: 'deuteronomy',
  josue: 'joshua',
  jueces: 'judges',
  rut: 'ruth',
  '1 samuel': '1-samuel',
  '2 samuel': '2-samuel',
  '1 reyes': '1-kings',
  '2 reyes': '2-kings',
  '1 cronicas': '1-chronicles',
  '2 cronicas': '2-chronicles',
  esdras: 'ezra',
  nehemias: 'nehemiah',
  ester: 'esther',
  job: 'job',
  salmos: 'psalms',
  salmo: 'psalms',
  proverbios: 'proverbs',
  eclesiastes: 'ecclesiastes',
  cantares: 'song-of-solomon',
  isaias: 'isaiah',
  jeremias: 'jeremiah',
  lamentaciones: 'lamentations',
  ezequiel: 'ezekiel',
  daniel: 'daniel',
  oseas: 'hosea',
  joel: 'joel',
  amos: 'amos',
  abdias: 'obadiah',
  jonas: 'jonah',
  miqueas: 'micah',
  nahum: 'nahum',
  habacuc: 'habakkuk',
  sofonias: 'zephaniah',
  hageo: 'haggai',
  zacarias: 'zechariah',
  malaquias: 'malachi',
  mateo: 'matthew',
  marcos: 'mark',
  lucas: 'luke',
  juan: 'john',
  hechos: 'acts',
  romanos: 'romans',
  '1 corintios': '1-corinthians',
  '2 corintios': '2-corinthians',
  galatas: 'galatians',
  efesios: 'ephesians',
  filipenses: 'philippians',
  colosenses: 'colossians',
  '1 tesalonicenses': '1-thessalonians',
  '2 tesalonicenses': '2-thessalonians',
  '1 timoteo': '1-timothy',
  '2 timoteo': '2-timothy',
  tito: 'titus',
  filemon: 'philemon',
  hebreos: 'hebrews',
  santiago: 'james',
  '1 pedro': '1-peter',
  '2 pedro': '2-peter',
  '1 juan': '1-john',
  '2 juan': '2-john',
  '3 juan': '3-john',
  judas: 'jude',
  apocalipsis: 'revelation',
};

function normalizarTexto(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[:.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intenta parsear referencias como:
 * "juan 3 16", "juan 3:16", "salmos 23 1", "isaias 41:10"
 */
export function parsearReferenciaBiblica(consulta) {
  const limpia = normalizarTexto(consulta);
  const match = limpia.match(/^(.+?)\s+(\d+)\s+(\d+)$/);
  if (!match) return null;

  const [, libroRaw, capitulo, versiculo] = match;
  const slugLibro = LIBROS_ES[libroRaw.trim()];
  if (!slugLibro) return null;

  return {
    libroOriginal: libroRaw.trim(),
    slugLibro,
    capitulo: Number(capitulo),
    versiculo: Number(versiculo),
  };
}

/**
 * Obtiene un versículo de Midvash API en la versión indicada (por defecto rvr1909)
 */
export async function obtenerVersiculoMidvash(referenciaTexto, version = 'rvr1909') {
  const parsed = parsearReferenciaBiblica(referenciaTexto);
  if (!parsed) {
    throw new Error(
      'Escribe una cita como "Juan 3:16", "Salmos 23:1" o "Isaias 41:10".'
    );
  }

  const url = `${BASE_URL}/${version}/${parsed.slugLibro}/${parsed.capitulo}/${parsed.versiculo}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('No se encontró ese pasaje en la API de Midvash.');
  }

  const json = await res.json();
  return {
    id: `midvash-${version}-${parsed.slugLibro}-${parsed.capitulo}-${parsed.versiculo}`,
    titulo: `${parsed.libroOriginal.toUpperCase()} ${parsed.capitulo}:${parsed.versiculo}`,
    subtitulo: `VERSIÓN ${(json?.data?.version || version).toUpperCase()}`,
    badge: 'BIBLIA API · MIDVASH',
    descripcion: json?.data?.text || '',
    referencia:
      json?.meta?.copyright ||
      `Midvash Bible API (${(json?.data?.version || version).toUpperCase()})`,
    estado_animo: 'Biblia',
    externo: true,
  };
}

/**
 * Obtiene el versículo del día (VOTD) desde Midvash
 */
export async function obtenerVersiculoDelDiaMidvash(version = 'rvr1909') {
  const url = `${BASE_URL}/votd?version=${version}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('No se pudo cargar el versículo del día.');
  }
  const json = await res.json();
  const data = json?.data || {};
  return {
    id: `votd-${version}`,
    titulo: data.reference || 'VERSÍCULO DEL DÍA',
    subtitulo: `VERSIÓN ${(data.version || version).toUpperCase()}`,
    badge: 'VERSÍCULO DEL DÍA',
    descripcion: data.text || '',
    referencia:
      json?.meta?.copyright ||
      `Midvash Bible API (${(data.version || version).toUpperCase()})`,
    estado_animo: 'Inspiración',
    externo: true,
  };
}