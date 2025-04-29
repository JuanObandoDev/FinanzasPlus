const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function () {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");

  const summaryContainer = document.getElementById("summary-container");
  const pageTitle = document.getElementById("Title");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID is not available");
    return;
  }

  try {
    const { data, error } = await SUPABASE.from("usuarios")
      .select("username")
      .eq("id_usuario", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    const userTitle = `Bienvenido, ${data.username}!`;
    pageTitle.innerHTML += `<br><br>${userTitle}`;

    const [totalIngresosResult, totalGastosResult] = await Promise.all([
      SUPABASE.rpc("sum_ingresos", { user_id: userId }),
      SUPABASE.rpc("sum_gastos", { user_id: userId }),
    ]);

    const total_ingresos = totalIngresosResult.data;
    const total_gastos = totalGastosResult.data;

    if (totalIngresosResult.error || totalGastosResult.error) {
      throw new Error(
        `Error fetching data: ${totalIngresosResult.error?.message || ""} ${
          totalGastosResult.error?.message || ""
        }`
      );
    }

    const fragment = document.createDocumentFragment();

    if (total_ingresos !== null) {
      const labelIncome = document.createElement("label");
      labelIncome.textContent = "Total ingresos:";
      const spanIncome = document.createElement("span");
      spanIncome.className = "box";
      spanIncome.textContent = `$${total_ingresos.toFixed(2)}`;
      fragment.appendChild(labelIncome);
      fragment.appendChild(spanIncome);
    }

    if (total_gastos !== null) {
      const labelExpenses = document.createElement("label");
      labelExpenses.textContent = "Total gastos:";
      const spanExpenses = document.createElement("span");
      spanExpenses.className = "box";
      spanExpenses.textContent = `$${total_gastos.toFixed(2)}`;
      fragment.appendChild(labelExpenses);
      fragment.appendChild(spanExpenses);
    }

    summaryContainer.appendChild(fragment);

    loaderContainer.style.display = "none";
    pageHeader.classList.remove("hidden");
    main.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error.message);
    alert(`Ha ocurrido un error: ${error.message}`);
  }
};
