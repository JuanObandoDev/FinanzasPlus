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

  const tableElement = document.getElementById("deudasTabla");

  try {
    const { data: deudas, error: deudasError } = await SUPABASE.from("deudas")
      .select("monto_pagar, fecha_vencimiento, id_categoria_deuda, descripcion")
      .eq("id_usuario", localStorage.getItem("userId"));
    if (deudasError)
      throw new Error(`Error fetching deudas: ${deudasError.message}`);

    const categoriasPromises = deudas.map((element) =>
      SUPABASE.from("categorias_deudas")
        .select("nombre")
        .eq("id_categoria_deuda", element.id_categoria_deuda)
        .single()
    );

    const categorias = await Promise.all(categoriasPromises);

    const headerRow = document.createElement("thead");
    const header = document.createElement("tr");

    [
      "ID",
      "Monto a pagar",
      "Fecha de vencimiento",
      "Categoría de deuda",
      "Descripción" /*, "Acciones"*/,
    ].forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      th.style.textAlign = "center";
      header.appendChild(th);
    });

    headerRow.appendChild(header);
    tableElement.appendChild(headerRow);

    const body = document.createElement("tbody");
    let counter = 1;
    deudas.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = counter;
      counter++;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = "$" + element.monto.toFixed(2);

      const tdFechaVencimiento = document.createElement("td");
      const fecha = new Date(element.fecha_vencimiento);
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      tdFechaVencimiento.textContent = fecha.toLocaleDateString(
        "es-ES",
        options
      );

      const tdFuente = document.createElement("td");
      tdFuente.textContent =
        categorias[index]?.data?.nombre || "Fuente no encontrada";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      /*const tdAcciones = document.createElement("td");
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);*/

      [
        tdId,
        tdMonto,
        tdFechaVencimiento,
        tdFuente,
        tdDescripcion /*, tdAcciones*/,
      ].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (body.innerHTML == "") {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.style.textAlign = "center";
      td.textContent = "No hay deudas registradas";
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
