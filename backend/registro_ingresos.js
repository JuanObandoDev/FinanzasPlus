const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function (event) {
  event.preventDefault();

  const { data, error } = await SUPABASE.from("fuentes_ingresos").select(
    "nombre"
  );

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const selectElement = document.getElementById("fuente");
  data.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.nombre;
    option.textContent = element.nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", function () {
    if (this.value === "Otra") {
      const newFuente = document.createElement("input");
      newFuente.setAttribute("type", "text");
      newFuente.setAttribute("id", "newFuente");
      newFuente.setAttribute("placeholder", "Escribe la nueva fuente");
      newFuente.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newFuente");
      newLabel.textContent = "Nueva fuente:";
      newLabel.setAttribute("id", "newFuenteLabel");

      this.parentNode.insertBefore(newFuente, this.nextSibling);
      this.parentNode.insertBefore(newLabel, this.nextSibling);

      const label = document.getElementById("descripcionLabel");
      label.textContent = "Descripción (obligatorio):";
      label.setAttribute("id", "descripcionLabelObligatorio");
      document.getElementById("descripcion").setAttribute("required", "true");
    } else {
      const newFuente = document.getElementById("newFuente");
      const newLabel = document.getElementById("newFuenteLabel");
      if (newFuente) {
        newFuente.remove();
        newLabel.remove();
      }
      const label = document.getElementById("descripcionLabelObligatorio");
      if (label) {
        label.textContent = "Descripción (opcional):";
        label.setAttribute("id", "descripcionLabel");
        document.getElementById("descripcion").removeAttribute("required");
      }
    }
  });
};

document
  .getElementById("incomeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const monto = document.getElementById("monto").value;
    let fuente = document.getElementById("fuente").value;
    let descripcion = document.getElementById("descripcion").value;
    const id_usuario = localStorage.getItem("userId");

    if (descripcion.length === 0) {
      const { data, error } = await SUPABASE.from("fuentes_ingresos")
        .select("descripcion")
        .eq("nombre", fuente)
        .single();
      descripcion = data.descripcion;

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }
    }

    const id_fuente = await SUPABASE.from("fuentes_ingresos")
      .select("id_fuente_ingreso")
      .eq("nombre", fuente)
      .single();
    if (id_fuente.error) {
      console.error("Error fetching data:", id_fuente.error);
      return;
    }
    const id_fuente_value = id_fuente.data.id_fuente_ingreso;

    const data = {
      id_usuario: id_usuario,
      monto: monto,
      id_fuente_ingreso: id_fuente_value,
      descripcion: descripcion,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ingresos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los datos en el servidor");
      }

      alert("El ingreso fue guardado exitosamente");
      window.location.href = "../pages/ingresos.html";
    } catch (error) {
      alert(error.message);
    }
  });
