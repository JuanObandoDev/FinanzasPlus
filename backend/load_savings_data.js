const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function (event) {
  event.preventDefault();

  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");

  const tableElement = document.getElementById("savingsTable");

  try {
    const { data: ahorros, error: ahorrosError } = await SUPABASE.from(
      "ahorros"
    )
      .select("monto, id_objetivo_ahorro, descripcion")
      .eq("id_usuario", localStorage.getItem("userId"));
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

    [
      "ID",
      "Monto",
      "Objetivo de ahorro",
      "Descripción" /*, "Acciones"*/,
    ].forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      header.appendChild(th);
    });

    headerRow.appendChild(header);
    tableElement.appendChild(headerRow);

    const body = document.createElement("tbody");
    let counter = 1;
    ahorros.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = counter;
      counter++;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = "$" + element.monto.toFixed(2);

      const tdObjetivo = document.createElement("td");
      tdObjetivo.textContent =
        objetivos[index]?.data?.nombre || "Objetivo no encontrado";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      /*const tdAcciones = document.createElement("td");
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);*/

      [tdId, tdMonto, tdObjetivo, tdDescripcion /*, tdAcciones*/].forEach(
        (td) => tr.appendChild(td)
      );
      body.appendChild(tr);
    });

    if (body.innerHTML == "") {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay ahorros registrados";
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
