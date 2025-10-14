// netlify/functions/getPedido.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const SHEET_ID = "14JOAkWEe5IzURpCwchlYQhzWkROL66ghDfKMFhl2-nQ";
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const RANGE = "Hoja1!A:D";

  const codigo = event.queryStringParameters.code?.trim().toUpperCase();
  if (!codigo) {
    return { statusCode: 400, body: JSON.stringify({ error: "Código faltante" }) };
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

    const indexCodigo = headers.indexOf("codigo_pedido");
    const indexCliente = headers.indexOf("cliente");
    const indexEstado = headers.indexOf("estado");
    const indexFecha = headers.indexOf("ultima_actualizacion");

    const pedido = filas.find(row => row[indexCodigo]?.trim().toUpperCase() === codigo);

    if (!pedido) {
      return { statusCode: 404, body: JSON.stringify({ estado: "No encontrado" }) };
    }

    const respuesta = {
      codigo: pedido[indexCodigo],
      cliente: pedido[indexCliente] || "",
      estado: pedido[indexEstado] || "",
      fecha: pedido[indexFecha] || ""
    };

    return { statusCode: 200, body: JSON.stringify(respuesta) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
