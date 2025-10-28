const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const formatCOP = (value) => {
  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${value < 0 ? "- " : ""}${formatter.format(Math.abs(value))}`;
};

let chart;
function renderChart(list) {
  const byCategory = list.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const labels = Object.keys(byCategory);
  const data = labels.map((label) => byCategory[label]);

  const ctx = document.getElementById("byCategoryChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monto por categoría",
          data,
          backgroundColor: ["#10b981", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: (v) => "$" + v } } },
    },
  });
}

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

    const overallBalance = total_ingresos - total_gastos;
    const balanceDiv = document.createElement("div");
    const labelBalance = document.createElement("label");
    labelBalance.textContent = "Balance general:";
    const spanBalance = document.createElement("span");
    spanBalance.className = "box";
    spanBalance.textContent = `${formatCOP(overallBalance)}`;
    balanceDiv.appendChild(labelBalance);
    balanceDiv.appendChild(spanBalance);
    fragment.appendChild(balanceDiv);

    if (total_ingresos !== null) {
      const incomeDiv = document.createElement("div");
      const labelIncome = document.createElement("label");
      labelIncome.textContent = "Total ingresos:";
      const spanIncome = document.createElement("span");
      spanIncome.className = "box";
      spanIncome.textContent = `${formatCOP(total_ingresos)}`;
      incomeDiv.appendChild(labelIncome);
      incomeDiv.appendChild(spanIncome);
      fragment.appendChild(incomeDiv);
    }

    if (total_gastos !== null) {
      const gastosDiv = document.createElement("div");
      const labelExpenses = document.createElement("label");
      labelExpenses.textContent = "Total gastos:";
      const spanExpenses = document.createElement("span");
      spanExpenses.className = "box";
      spanExpenses.textContent = `${formatCOP(total_gastos)}`;
      gastosDiv.appendChild(labelExpenses);
      gastosDiv.appendChild(spanExpenses);
      fragment.appendChild(gastosDiv);
    }

    summaryContainer.prepend(fragment);

    renderChart([
      { category: "Ingresos", amount: total_ingresos },
      { category: "Gastos", amount: total_gastos },
    ]);

    loaderContainer.style.display = "none";
    pageHeader.classList.remove("hidden");
    main.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error.message);
    alert(`Ha ocurrido un error: ${error.message}`);
  }
};
