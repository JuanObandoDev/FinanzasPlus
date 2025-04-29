const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function () {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("incomeTable");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  try {
    const { data: ingresos, error: ingresosError } = await SUPABASE.from(
      "ingresos"
    )
      .select("monto, id_fuente_ingreso, descripcion")
      .eq("id_usuario", userId);

    if (ingresosError)
      throw new Error(`Error fetching ingresos: ${ingresosError.message}`);

    const fuentesPromises = ingresos.map((element) =>
      SUPABASE.from("fuentes_ingresos")
        .select("nombre")
        .eq("id_fuente_ingreso", element.id_fuente_ingreso)
        .single()
    );
    const fuentesResults = await Promise.all(fuentesPromises);

    const headerRow = document.createElement("thead");
    const header = document.createElement("tr");
    ["ID", "Monto", "Fuente de ingreso", "Descripción"].forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      th.style.textAlign = "center";
      header.appendChild(th);
    });
    headerRow.appendChild(header);
    tableElement.appendChild(headerRow);

    const body = document.createElement("tbody");
    ingresos.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto.toFixed(2)}`;

      const tdFuente = document.createElement("td");
      tdFuente.textContent =
        fuentesResults[index]?.data?.nombre || "Fuente no encontrada";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      [tdId, tdMonto, tdFuente, tdDescripcion].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!ingresos.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay ingresos registrados";
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
