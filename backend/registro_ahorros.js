const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const loaderContainer = document.getElementById("loader-container");
  const container = document.getElementById("container");

  try {
    const { data: objetivos, error } = await SUPABASE.from(
      "objetivos_ahorros"
    ).select("nombre");
    if (error)
      throw new Error(`Error al obtener los objetivos: ${error.message}`);

    populateSelectOptions(objetivos);

    loaderContainer.style.display = "none";
    container.classList.remove("hidden");
  } catch (error) {
    console.error(error.message);
    alert("Hubo un problema al cargar los objetivos de ahorro.");
  }
};

function populateSelectOptions(objetivos) {
  const selectElement = document.getElementById("objetivo");

  objetivos.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", handleSelectChange);
}

function handleSelectChange(event) {
  const isOtra = event.target.value === "Otra";
  toggleNewObjetivoInputs(isOtra);
  toggleDescripcionRequired(isOtra);
}

function toggleNewObjetivoInputs(show) {
  const parent = document.getElementById("objetivo").parentNode;

  if (show) {
    if (!document.getElementById("newObjetivo")) {
      const newObjetivo = document.createElement("input");
      newObjetivo.setAttribute("type", "text");
      newObjetivo.setAttribute("id", "newObjetivo");
      newObjetivo.setAttribute("placeholder", "Escribe el nuevo objetivo");
      newObjetivo.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newObjetivo");
      newLabel.textContent = "Nueva fuente:";
      newLabel.setAttribute("id", "newObjetivoLabel");

      parent.insertBefore(
        newLabel,
        parent.querySelector("#objetivo").nextSibling
      );
      parent.insertBefore(newObjetivo, newLabel.nextSibling);
    }
  } else {
    const newObjetivo = document.getElementById("newObjetivo");
    const newLabel = document.getElementById("newObjetivoLabel");
    if (newObjetivo) newObjetivo.remove();
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
  .getElementById("ahorrosForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const monto = parseFloat(document.getElementById("monto").value);
      const objetivo = document.getElementById("objetivo").value;
      const descripcionInput = document.getElementById("descripcion").value;
      const id_usuario = localStorage.getItem("userId");

      if (monto <= 0) {
        alert("El monto debe ser mayor a 0");
        document.getElementById("monto").focus();
        return;
      }

      const descripcion = await getDescripcion(objetivo, descripcionInput);
      const id_objetivo_ahorro = await getObjetivoId(objetivo);

      const data = {
        id_usuario,
        monto,
        id_objetivo_ahorro,
        descripcion,
      };

      await saveSavings(data);

      alert("El ahorro fue guardado exitosamente");
      window.location.href = "../pages/ahorros.html";
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

async function getDescripcion(objetivo, descripcionInput) {
  if (descripcionInput.trim().length > 0) return descripcionInput;

  const { data, error } = await SUPABASE.from("objetivos_ahorros")
    .select("descripcion")
    .eq("nombre", objetivo)
    .single();

  if (error)
    throw new Error(`Error al obtener la descripción: ${error.message}`);
  return data.descripcion;
}

async function getObjetivoId(objetivo) {
  const { data, error } = await SUPABASE.from("objetivos_ahorros")
    .select("id_objetivo_ahorro")
    .eq("nombre", objetivo)
    .single();

  if (error)
    throw new Error(`Error al obtener el ID del objetivo: ${error.message}`);
  return data.id_objetivo_ahorro;
}

async function saveSavings(data) {
  const { error } = await SUPABASE.from("ahorros").insert([data]);
  if (error) throw new Error("Error al guardar los datos en el servidor");
}
