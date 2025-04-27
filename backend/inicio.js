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

  const summaryContainer = document.getElementById("summary-container");
  const pageTitle = document.getElementById("Title");

  try {
    const { data, error } = await SUPABASE.from("usuarios")
      .select("username")
      .eq("id_usuario", localStorage.getItem("userId"))
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    const userTitle = "Bienvenido, " + data.username + "!";
    pageTitle.innerHTML += `<br><br>` + userTitle;

    const { data: total_ingresos, error: total_ingresos_error } =
      await SUPABASE.rpc("sum_ingresos", {
        user_id: localStorage.getItem("userId"),
      });

    if (total_ingresos_error)
      throw new Error(
        `Error fetching total ingresos: ${total_ingresos_error.message}`
      );

    if (total_ingresos != null && total_ingresos != undefined) {
      const labelIncome = document.createElement("label");
      labelIncome.textContent = "Total ingresos:";
      const spanIncome = document.createElement("span");
      spanIncome.className = "box";
      spanIncome.textContent = "$" + total_ingresos.toFixed(2);
      summaryContainer.appendChild(labelIncome);
      summaryContainer.appendChild(spanIncome);
    }

    const { data: total_gastos, error: total_gastos_error } =
      await SUPABASE.rpc("sum_gastos", {
        user_id: localStorage.getItem("userId"),
      });
    if (total_gastos_error)
      throw new Error(
        `Error fetching total gastos: ${total_gastos_error.message}`
      );

    if (total_gastos != null && total_gastos != undefined) {
      const labelExpenses = document.createElement("label");
      labelExpenses.textContent = "Total gastos:";
      const spanExpenses = document.createElement("span");
      spanExpenses.className = "box";
      spanExpenses.textContent = "$" + total_gastos.toFixed(2);
      summaryContainer.appendChild(labelExpenses);
      summaryContainer.appendChild(spanExpenses);
    }
    loaderContainer.style.display = "none";
    pageHeader.classList.remove("hidden");
    main.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error.message);
  }
};
