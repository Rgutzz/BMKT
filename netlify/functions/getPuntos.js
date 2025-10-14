const fetch = require("node-fetch");

exports.handler = async (event) => {
  const SHEET_ID = "14JOAkWEe5IzURpCwchlYQhzWkROL66ghDfKMFhl2-nQ";
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const RANGE = "Puntos!A:E"; // <-- hoja "Puntos"

  const dni = event.queryStringParameters.dni?.trim();
  if (!dni) {
    return { statusCode: 400, body: JSON.stringify({ error: "DNI faltante" }) };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values) {
      return { statusCode: 500, body: JSON.stringify({ error: "No se pudo leer la hoja." }) };
    }

    const filas = data.values;
    const headers = filas.shift();

    const iDNI = headers.indexOf("dni_cliente");
    const iNombre = headers.indexOf("nombre");
    const iPuntos = headers.indexOf("puntos");
    const iEstrellas = headers.indexOf("estrellas");
    const iFecha = headers.indexOf("ultima_actualizacion");

    const cliente = filas.find(r => r[iDNI] === dni);

    if (!cliente) {
      return { statusCode: 404, body: JSON.stringify({ estado: "No encontrado" }) };
    }

    const puntos = parseInt(cliente[iPuntos] || "0");
    const estrellas = Math.floor(puntos / 3);
    let beneficio = "";

    if (estrellas >= 9) beneficio = "🎉 20% de descuento";
    else if (estrellas >= 6) beneficio = "💎 15% de descuento";
    else if (estrellas >= 3) beneficio = "🚚 Envío gratis";
    else beneficio = "🌱 Sigue acumulando puntos";

    const respuesta = {
      nombre: cliente[iNombre],
      dni: cliente[iDNI],
      puntos,
      estrellas,
      beneficio,
      fecha: cliente[iFecha] || "—"
    };

    return { statusCode: 200, body: JSON.stringify(respuesta) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
