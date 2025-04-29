const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function (event) {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("savingsTable");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }
  try {
    const { data: ahorros, error: ahorrosError } = await SUPABASE.from(
      "ahorros"
    )
      .select("monto, id_objetivo_ahorro, descripcion")
      .eq("id_usuario", userId);

    if (ahorrosError)
      throw new Error(`Error fetching ahorros: ${ahorrosError.message}`);

    const objetivosPromises = ahorros.map((element) =>
      SUPABASE.from("objetivos_ahorros")
        .select("nombre")
        .eq("id_objetivo_ahorro", element.id_objetivo_ahorro)
        .single()
    );
    const objetivos = await Promise.all(objetivosPromises);

    const headerRow = document.createElement("thead");
    const header = document.createElement("tr");
    ["ID", "Monto", "Objetivo de ahorro", "Descripción"].forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      th.style.textAlign = "center";
      header.appendChild(th);
    });
    headerRow.appendChild(header);
    tableElement.appendChild(headerRow);

    const body = document.createElement("tbody");
    ahorros.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto.toFixed(2)}`;

      const tdObjetivo = document.createElement("td");
      tdObjetivo.textContent =
        objetivos[index]?.data?.nombre || "Objetivo no encontrado";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      [tdId, tdMonto, tdObjetivo, tdDescripcion].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!ahorros.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay ahorros registrados";
      td.style.textAlign = "center";
      tr.appendChild(td);
      body.appendChild(tr);
    }

    tableElement.appendChild(body);

    loaderContainer.style.display = "none";
    pageHeader.classList.remove("hidden");
    main.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error.message);
  }
};
