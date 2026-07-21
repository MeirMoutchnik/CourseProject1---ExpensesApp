const CHART_COLORS = [
  "#e74c3c",
  "#27ae60",
  "#2980b9",
  "#f39c12",
  "#8e44ad",
  "#16a085",
  "#d35400",
  "#2c3e50",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let categoryChart = null;
let monthChart = null;

function getExpenses() {
  return JSON.parse(localStorage.getItem("expenses")) || [];
}

function totalsByCategory(expenses) {
  const totals = {};
  expenses.forEach((expense) => {
    const key = expense.category || "unknown";
    totals[key] = (totals[key] || 0) + Number(expense.amount);
  });
  return totals;
}

function totalsByMonth(expenses) {
  const totals = {};
  expenses.forEach((expense) => {
    if (!expense.date) return;
    const key = expense.date.slice(0, 7); // YYYY-MM
    totals[key] = (totals[key] || 0) + Number(expense.amount);
  });
  return Object.keys(totals)
    .sort()
    .reduce((ordered, key) => {
      ordered[key] = totals[key];
      return ordered;
    }, {});
}

function formatMonthLabel(yyyyMm) {
  const [year, month] = yyyyMm.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function renderPieChart(expenses) {
  const canvas = document.getElementById("category-pie-chart");
  const emptyMsg = document.getElementById("pie-empty");
  const totals = totalsByCategory(expenses);
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (categoryChart) {
    categoryChart.destroy();
    categoryChart = null;
  }

  if (labels.length === 0) {
    canvas.hidden = true;
    emptyMsg.hidden = false;
    return;
  }

  canvas.hidden = false;
  emptyMsg.hidden = true;

  categoryChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: false },
      },
    },
  });
}

function renderMonthHistogram(expenses) {
  const canvas = document.getElementById("month-bar-chart");
  const emptyMsg = document.getElementById("bar-empty");
  const totals = totalsByMonth(expenses);
  const labels = Object.keys(totals).map(formatMonthLabel);
  const values = Object.values(totals);

  if (monthChart) {
    monthChart.destroy();
    monthChart = null;
  }

  if (labels.length === 0) {
    canvas.hidden = true;
    emptyMsg.hidden = false;
    return;
  }

  canvas.hidden = false;
  emptyMsg.hidden = true;

  monthChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total amount",
          data: values,
          backgroundColor: "#2980b9",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Amount" },
        },
        x: {
          title: { display: true, text: "Month" },
        },
      },
    },
  });
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createCsvReport() {
  const expenses = getExpenses();
  if (expenses.length === 0) {
    alert("No expenses to export.");
    return;
  }

  const header = ["Category", "Description", "Amount", "Date"];
  const rows = expenses.map((expense) =>
    [
      expense.category,
      expense.description,
      expense.amount,
      expense.date,
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  downloadBlob(
    "expenses.csv",
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );
}

function createPdfReport() {
  const expenses = getExpenses();
  if (expenses.length === 0) {
    alert("No expenses to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFontSize(16);
  doc.text("Expenses Report", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 8;

  const categoryTotals = totalsByCategory(expenses);
  const grandTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  doc.setFontSize(12);
  doc.text("Summary by category", 14, y);
  y += 7;
  doc.setFontSize(10);
  Object.entries(categoryTotals).forEach(([category, total]) => {
    doc.text(`${category}: ${total}`, 18, y);
    y += 6;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });

  y += 4;
  doc.setFontSize(12);
  doc.text(`Grand total: ${grandTotal}`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("All expenses", 14, y);
  y += 7;
  doc.setFontSize(9);

  expenses.forEach((expense, index) => {
    const line = `${index + 1}. ${expense.date} | ${expense.category} | ${expense.description} | ${expense.amount}`;
    const wrapped = doc.splitTextToSize(line, pageWidth - 28);
    if (y + wrapped.length * 5 > 280) {
      doc.addPage();
      y = 16;
    }
    doc.text(wrapped, 14, y);
    y += wrapped.length * 5 + 2;
  });

  doc.save("expenses-report.pdf");
}

function initGraphsPage() {
  const expenses = getExpenses();
  renderPieChart(expenses);
  renderMonthHistogram(expenses);

  document.getElementById("pdf-btn").addEventListener("click", createPdfReport);
  document.getElementById("csv-btn").addEventListener("click", createCsvReport);
}

initGraphsPage();
