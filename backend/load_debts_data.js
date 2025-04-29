const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function () {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("deudasTabla");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  try {
    const { data: deudas, error: deudasError } = await SUPABASE.from("deudas")
      .select("monto_pagar, fecha_vencimiento, id_categoria_deuda, descripcion")
      .eq("id_usuario", userId);

    if (deudasError)
      throw new Error(`Error fetching deudas: ${deudasError.message}`);

    const categoriasPromises = deudas.map((element) =>
      SUPABASE.from("categorias_deudas")
        .select("nombre")
        .eq("id_categoria_deuda", element.id_categoria_deuda)
        .single()
    );
    const categoriasResults = await Promise.all(categoriasPromises);

    const headerRow = document.createElement("thead");
    const header = document.createElement("tr");
    [
      "ID",
      "Monto a pagar",
      "Fecha de vencimiento",
      "Categoria de deuda",
      "Descripción",
    ].forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      th.style.textAlign = "center";
      header.appendChild(th);
    });
    headerRow.appendChild(header);
    tableElement.appendChild(headerRow);

    const body = document.createElement("tbody");
    deudas.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto_pagar.toFixed(2)}`;

      const tdFecha = document.createElement("td");
      tdFecha.textContent = new Date(
        element.fecha_vencimiento
      ).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const tdFuente = document.createElement("td");
      tdFuente.textContent =
        categoriasResults[index]?.data?.nombre || "categoria no encontrada";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      [tdId, tdMonto, tdFecha, tdFuente, tdDescripcion].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!deudas.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay deudas registradas";
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
