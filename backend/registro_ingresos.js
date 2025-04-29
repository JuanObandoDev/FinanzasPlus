const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const loaderContainer = document.getElementById("loader-container");
  const container = document.getElementById("container");

  try {
    const { data: fuentes, error } = await SUPABASE.from(
      "fuentes_ingresos"
    ).select("nombre");
    if (error)
      throw new Error(`Error al obtener las fuentes: ${error.message}`);

    populateSelectOptions(fuentes);

    loaderContainer.style.display = "none";
    container.classList.remove("hidden");
  } catch (error) {
    console.error(error.message);
    alert("Hubo un problema al cargar las fuentes de ingresos.");
  }
};

function populateSelectOptions(fuentes) {
  const selectElement = document.getElementById("fuente");

  fuentes.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", handleSelectChange);
}

function handleSelectChange(event) {
  const isOtra = event.target.value === "Otra";
  toggleNewFuenteInputs(isOtra);
  toggleDescripcionRequired(isOtra);
}

function toggleNewFuenteInputs(show) {
  const parent = document.getElementById("fuente").parentNode;

  if (show) {
    if (!document.getElementById("newFuente")) {
      const newFuente = document.createElement("input");
      newFuente.setAttribute("type", "text");
      newFuente.setAttribute("id", "newFuente");
      newFuente.setAttribute("placeholder", "Escribe la nueva fuente");
      newFuente.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newFuente");
      newLabel.textContent = "Nueva fuente:";
      newLabel.setAttribute("id", "newFuenteLabel");

      parent.insertBefore(
        newLabel,
        parent.querySelector("#fuente").nextSibling
      );
      parent.insertBefore(newFuente, newLabel.nextSibling);
    }
  } else {
    const newFuente = document.getElementById("newFuente");
    const newLabel = document.getElementById("newFuenteLabel");
    if (newFuente) newFuente.remove();
    if (newLabel) newLabel.remove();
  }
}

function toggleDescripcionRequired(required) {
  const descripcion = document.getElementById("descripcion");
  const label = document.getElementById(
    required ? "descripcionLabel" : "descripcionLabelObligatorio"
  );

  if (label) {
    label.textContent = required
      ? "Descripción (obligatorio):"
      : "Descripción (opcional):";
    label.setAttribute(
      "id",
      required ? "descripcionLabelObligatorio" : "descripcionLabel"
    );

    if (required) descripcion.setAttribute("required", "true");
    else descripcion.removeAttribute("required");
  }
}

document
  .getElementById("incomeForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const monto = parseFloat(document.getElementById("monto").value);
      const fuente = document.getElementById("fuente").value;
      const descripcionInput = document.getElementById("descripcion").value;
      const id_usuario = localStorage.getItem("userId");

      if (monto <= 0) {
        alert("El monto debe ser mayor a 0");
        document.getElementById("monto").focus();
        return;
      }

      const descripcion = await getDescripcion(fuente, descripcionInput);
      const id_fuente_ingreso = await getFuenteId(fuente);

      const data = {
        id_usuario,
        monto,
        id_fuente_ingreso,
        descripcion,
      };

      await saveIncome(data);

      alert("El ingreso fue guardado exitosamente");
      window.location.href = "../pages/ingresos.html";
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

async function getDescripcion(fuente, descripcionInput) {
  if (descripcionInput.trim().length > 0) return descripcionInput;

  const { data, error } = await SUPABASE.from("fuentes_ingresos")
    .select("descripcion")
    .eq("nombre", fuente)
    .single();

  if (error)
    throw new Error(`Error al obtener la descripción: ${error.message}`);
  return data.descripcion;
}

async function getFuenteId(fuente) {
  const { data, error } = await SUPABASE.from("fuentes_ingresos")
    .select("id_fuente_ingreso")
    .eq("nombre", fuente)
    .single();

  if (error)
    throw new Error(`Error al obtener el ID de la fuente: ${error.message}`);
  return data.id_fuente_ingreso;
}

async function saveIncome(data) {
  const { error } = await SUPABASE.from("ingresos").insert([data]);
  if (error) throw new Error("Error al guardar los datos en el servidor");
}
