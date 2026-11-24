import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Revalida automáticamente cada 1 hora (3600 segundos) para reflejar el cambio diario sin alentar la página
export const revalidate = 3600;

function obtenerFechaVaticano() {
  // Usa la fecha actual en zona horaria de México (o local) en formato YYYY/MM/DD
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);

  const year = partes.find((p) => p.type === 'year')?.value;
  const month = partes.find((p) => p.type === 'month')?.value;
  const day = partes.find((p) => p.type === 'day')?.value;

  return `${year}/${month}/${day}`;
}

function extraerLecturas(html) {
  const $ = cheerio.load(html);

  let indicacionLiturgica = null;
  const primeraLectura = { cita: null, lectura: null };
  const evangelio = { cita: null, lectura: null };

  const indicacion = $('[class*="indicazioneLiturgica"], .indicazioneLiturgica');
  if (indicacion.length > 0) {
    indicacionLiturgica = indicacion.eq(0).text().trim();
  }

  $('section.section--evidence').each((_, element) => {
    const section = $(element);
    const title = section.find('h2').text().trim();
    const paragraphs = section.find('p');

    if (title === 'Lectura del Día' && paragraphs.length >= 2) {
      primeraLectura.cita = paragraphs.eq(1).text().trim();
      let texto = '';
      for (let j = 2; j < paragraphs.length; j++) {
        const t = $(paragraphs[j]).text().trim();
        if (t.length > 0) texto += (texto ? ' ' : '') + t;
      }
      primeraLectura.lectura = texto;
    } else if (title === 'Evangelio del Día' && paragraphs.length >= 2) {
      evangelio.cita = paragraphs.eq(1).text().trim();
      let texto = '';
      for (let j = 2; j < paragraphs.length; j++) {
        const t = $(paragraphs[j]).text().trim();
        if (t.length > 0) texto += (texto ? ' ' : '') + t;
      }
      evangelio.lectura = texto;
    }
  });

  return { indicacionLiturgica, primeraLectura, evangelio };
}

export async function GET() {
  try {
    const fechaUrl = obtenerFechaVaticano();
    const url = `https://www.vaticannews.va/es/evangelio-de-hoy/${fechaUrl}.html`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Vatican News respondió ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const lecturas = extraerLecturas(html);

    if (!lecturas.evangelio?.lectura) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el Evangelio del Día en el HTML' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fecha: fechaUrl,
      url,
      lecturas,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener evangelio' },
      { status: 500 }
    );
  }
}