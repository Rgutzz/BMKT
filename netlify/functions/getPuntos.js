// netlify/functions/getPuntos.js

export async function handler(event) {
  const SHEET_ID = "14JOAkWEe5IzURpCwchlYQhzWkROL66ghDfKMFhl2-nQ";
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const RANGE = "Puntos!A:E"; // hoja "Puntos"

  const dni = event.queryStringParameters?.dni?.trim();
  if (!dni) {
    return { statusCode: 400, body: JSON.stringify({ error: "DNI faltante" }) };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: "Error al leer la hoja" }) };
    }

    const data = await res.json();
    if (!data.values) {
      return { statusCode: 500, body: JSON.stringify({ error: "No se pudo leer la hoja." }) };
    }

    const filas = data.values;
    const headers = filas.shift();

    const iDNI = headers.indexOf("dni_cliente");
    const iNombre = headers.indexOf("nombre");
    const iPuntos = headers.indexOf("puntos"); // 1 punto = 1 estrella
    const iFecha = headers.indexOf("ultima_actualizacion");

    const cliente = filas.find(r => r[iDNI]?.trim() === dni);

    if (!cliente) {
      return { statusCode: 404, body: JSON.stringify({ estado: "No encontrado" }) };
    }

    const estrellas = parseInt(cliente[iPuntos] || "0"); // 1 punto = 1 estrella
    let beneficio = "";

    // Nueva lógica: beneficios solo exactos
    switch (estrellas) {
      case 2:
        beneficio = "🚚 Envío gratis en tu próxima compra";
        break;
      case 4:
        beneficio = "💎 15% de descuento en cualquier producto en tu próxima compra";
        break;
      case 6:
        beneficio = "🎉 20% de descuento VIP y prioridad en envíos en tu próxima compra";
        break;
      default:
        beneficio = "🌱 Sigue acumulando estrellas para más beneficios";
    }

    const respuesta = {
      nombre: cliente[iNombre] || "",
      dni: cliente[iDNI] || dni,
      estrellas,
      beneficio,
      fecha: cliente[iFecha] || "—"
    };

    return { statusCode: 200, body: JSON.stringify(respuesta) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
