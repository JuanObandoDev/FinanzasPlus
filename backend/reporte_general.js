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

const parseDateInput = (val) => (val ? new Date(`${val}T00:00:00`) : null);

function renderTable(list) {
  const txBody = document.getElementById("txBody");
  txBody.innerHTML = list.length
    ? list
        .map(
          (tx) => `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.description}</td>
          <td>${tx.category}</td>
          <td class="right">${formatCOP(tx.amount)}</td>
        </tr>
      `
        )
        .join("")
    : '<tr><td colspan="5" class="text-muted">No hay transacciones para las opciones seleccionadas.</td></tr>';
}

function summarize(list) {
  const categories = ["ingreso", "gasto", "ahorro", "deuda"];
  const summary = categories.reduce((acc, cat) => {
    acc[cat] = list.reduce(
      (sum, tx) =>
        tx.category?.toLowerCase() === cat ? sum + Number(tx.amount) : sum,
      0
    );
    return acc;
  }, {});

  const count = list.length;
  const avg = count
    ? list.reduce((s, t) => s + Math.abs(t.amount), 0) / count
    : 0;

  document.getElementById("totalIncome").textContent = formatCOP(
    summary.ingreso
  );
  document.getElementById("totalExpense").textContent = formatCOP(
    summary.gasto
  );
  document.getElementById("totalSavings").textContent = formatCOP(
    summary.ahorro
  );
  document.getElementById("totalDebts").textContent = formatCOP(summary.deuda);
  document.getElementById("countTx").textContent = count;
  document.getElementById("avgTx").textContent = formatCOP(avg);
}

let chart;
function renderChart(list) {
  // fixed order and ensure zero values for missing categories
  const categoriesOrder = ["Ingreso", "Gasto", "Ahorro", "Deuda"];
  const sums = list.reduce((acc, tx) => {
    const key = (tx.category || "").toLowerCase();
    acc[key] = (acc[key] || 0) + Number(tx.amount || 0);
    return acc;
  }, {});
  const labels = categoriesOrder;
  const data = categoriesOrder.map((c) => sums[c.toLowerCase()] || 0);
  const colors = ["#10b981", "#ef4444", "#2563eb", "#f59e0b"];

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
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: (v) => formatCOP(Number(v)) } } },
    },
  });
}

function applyFilters() {
  const start = parseDateInput(document.getElementById("rangeStart").value);
  const end = parseDateInput(document.getElementById("rangeEnd").value);
  const category = document.getElementById("category").value;

  filtered = transactions
    .filter(({ date, category: cat }) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const dt = new Date(`${date}T00:00:00`);
      if (isNaN(dt)) return false;
      if (start && dt < start) return false;
      if (end && dt > end) return false;
      return category === "all" || cat.toLowerCase() === category.toLowerCase();
    })
    .sort(
      (a, b) => new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`)
    );

  renderTable(filtered);
  summarize(filtered);
  renderChart(filtered);
}

async function exportPDF() {
  if (!filtered.length) return alert("No hay datos para exportar");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFontSize(14);
  doc.text("Reporte general — FinanzasPlus", 40, 40);

  const head = [["Fecha", "Descripción", "Categoría", "Monto"]];
  const body = filtered.map(({ date, description, category, amount }) => [
    date,
    description,
    category,
    amount.toFixed(2),
  ]);

  doc.autoTable({
    startY: 60,
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
    theme: "striped",
    margin: { left: 40, right: 40 },
  });

  doc.save("reporte_general.pdf");
}

function setActiveButton(activeId) {
  const ids = ["last7", "last30", "thisMonth", "reset"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === activeId) {
      el.style.backgroundColor = "#2563eb"; // azul de fondo
      el.style.color = "#ffffff"; // texto blanco
      // el.style.border = "1px solid #2563eb";
    } else {
      el.style.backgroundColor = "#ffffff"; // fondo blanco
      el.style.color = "#2563eb"; // texto azul
      // el.style.border = "1px solid #2563eb";
    }
  });
}

// Global click listener to toggle active styles when any control button is clicked
document.addEventListener("click", (e) => {
  const ids = ["last7", "last30", "thisMonth", "reset"];
  const target = e.target;
  if (target && ids.includes(target.id)) {
    setActiveButton(target.id);
  }
});

function setRangeDays(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  document.getElementById("rangeStart").value = start
    .toISOString()
    .slice(0, 10);
  document.getElementById("rangeEnd").value = end.toISOString().slice(0, 10);
  applyFilters();
  // Fallback: si por alguna razón el click no activó el listener, aplica el estilo al elemento activo
  const activeId = document.activeElement?.id;
  if (activeId) setActiveButton(activeId);
}

function setThisMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  document.getElementById("rangeStart").value = start
    .toISOString()
    .slice(0, 10);
  document.getElementById("rangeEnd").value = end.toISOString().slice(0, 10);
  applyFilters();
}

function resetFilters() {
  document.getElementById("rangeStart").value = "";
  document.getElementById("rangeEnd").value = "";
  document.getElementById("category").value = "all";
  filtered = [...transactions];
  applyFilters();
}

let transactions = [];
let filtered = [];

window.onload = async function () {
  const loaderContainer = document.getElementById("loader-container");

  const userId = localStorage.getItem("userId");
  if (!userId) return console.error("User ID is not disponible");

  try {
    const fetchTable = async (table, fields) => {
      const { data, error } = await SUPABASE.from(table)
        .select(fields)
        .eq("id_usuario", userId);
      if (error) throw error;
      return data;
    };

    const ingresos = await fetchTable(
      "ingresos",
      "monto, descripcion, created_at"
    );
    const gastos = await fetchTable("gastos", "monto, descripcion, created_at");
    const ahorros = await fetchTable(
      "ahorros",
      "monto, descripcion, created_at"
    );
    const deudas = await fetchTable(
      "deudas",
      "monto_pagar, descripcion, created_at"
    );

    transactions = [
      ...ingresos.map((i) => ({
        date: i.created_at.slice(0, 10),
        description: i.descripcion,
        category: "Ingreso",
        amount: Number(i.monto),
      })),
      ...gastos.map((g) => ({
        date: g.created_at.slice(0, 10),
        description: g.descripcion,
        category: "Gasto",
        amount: Number(g.monto),
      })),
      ...ahorros.map((a) => ({
        date: a.created_at.slice(0, 10),
        description: a.descripcion,
        category: "Ahorro",
        amount: Number(a.monto),
      })),
      ...deudas.map((d) => ({
        date: d.created_at.slice(0, 10),
        description: d.descripcion,
        category: "Deuda",
        amount: Number(d.monto_pagar),
      })),
    ];

    filtered = [...transactions];

    document.getElementById("apply").addEventListener("click", applyFilters);
    document.getElementById("clear").addEventListener("click", resetFilters);
    document.getElementById("exportPdf").addEventListener("click", exportPDF);
    document
      .getElementById("last7")
      .addEventListener("click", () => setRangeDays(7));
    document
      .getElementById("last30")
      .addEventListener("click", () => setRangeDays(30));
    document
      .getElementById("thisMonth")
      .addEventListener("click", setThisMonth);
    document.getElementById("reset").addEventListener("click", resetFilters);
    applyFilters();
  } catch (error) {
    console.error("Error loading transactions:", error);
  } finally {
    loaderContainer.style.display = "none";
  }
};
