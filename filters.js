const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getExpenses() {
  return JSON.parse(localStorage.getItem("expenses")) || [];
}

function parseExpenseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  return { year, month, day };
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => Number(a) - Number(b));
}

function fillSelect(select, placeholder, values, labels) {
  const previous = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  values.forEach((value, index) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labels ? labels[index] : value;
    select.appendChild(option);
  });
  if (values.includes(previous)) {
    select.value = previous;
  }
}

function populateYearOptions() {
  const yearSelect = document.getElementById("filter-year");
  const years = uniqueSorted(
    getExpenses()
      .map((expense) => parseExpenseDate(expense.date))
      .filter(Boolean)
      .map((d) => d.year)
  );
  fillSelect(yearSelect, "All years", years);
}

function populateMonthOptions() {
  const year = document.getElementById("filter-year").value;
  const monthSelect = document.getElementById("filter-month");
  const daySelect = document.getElementById("filter-day");

  if (!year) {
    monthSelect.disabled = true;
    daySelect.disabled = true;
    fillSelect(monthSelect, "All months", []);
    fillSelect(daySelect, "All days", []);
    return;
  }

  monthSelect.disabled = false;
  const months = uniqueSorted(
    getExpenses()
      .map((expense) => parseExpenseDate(expense.date))
      .filter((d) => d && d.year === year)
      .map((d) => d.month)
  );
  fillSelect(
    monthSelect,
    "All months",
    months,
    months.map((m) => MONTH_NAMES[Number(m) - 1])
  );
  populateDayOptions();
}

function populateDayOptions() {
  const year = document.getElementById("filter-year").value;
  const month = document.getElementById("filter-month").value;
  const daySelect = document.getElementById("filter-day");

  if (!year || !month) {
    daySelect.disabled = true;
    fillSelect(daySelect, "All days", []);
    return;
  }

  daySelect.disabled = false;
  const days = uniqueSorted(
    getExpenses()
      .map((expense) => parseExpenseDate(expense.date))
      .filter((d) => d && d.year === year && d.month === month)
      .map((d) => d.day)
  );
  fillSelect(daySelect, "All days", days);
}

function getFilteredExpenses() {
  const year = document.getElementById("filter-year").value;
  const month = document.getElementById("filter-month").value;
  const day = document.getElementById("filter-day").value;
  const maxAmountRaw = document.getElementById("filter-max-amount").value;
  const maxAmount =
    maxAmountRaw === "" ? null : Number(maxAmountRaw);

  return getExpenses().filter((expense) => {
    const parsed = parseExpenseDate(expense.date);
    if (!parsed) return false;

    if (year && parsed.year !== year) return false;
    if (month && parsed.month !== month) return false;
    if (day && parsed.day !== day) return false;
    if (maxAmount !== null && !Number.isNaN(maxAmount)) {
      if (Number(expense.amount) > maxAmount) return false;
    }

    return true;
  });
}

function renderFilteredTable() {
  const tableBody = document.getElementById("filtered-expense-table-body");
  const expenses = getFilteredExpenses();

  tableBody.innerHTML = "";

  if (expenses.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="4">No expenses match these filters.</td>`;
    tableBody.appendChild(emptyRow);
  } else {
    expenses.forEach((expense) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${expense.category}</td>
        <td>${expense.description}</td>
        <td>${expense.amount}</td>
        <td>${expense.date}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );
  const totalRow = document.createElement("tr");
  totalRow.className = "total-row";
  totalRow.innerHTML = `
    <td class="total-label">Total</td>
    <td class="total-amount">${total}</td>
  `;
  tableBody.appendChild(totalRow);
}

function clearFilters() {
  document.getElementById("filter-year").value = "";
  document.getElementById("filter-max-amount").value = "";
  populateMonthOptions();
  renderFilteredTable();
}

function initFiltersPage() {
  populateYearOptions();
  populateMonthOptions();
  renderFilteredTable();

  document
    .getElementById("filter-year")
    .addEventListener("change", () => {
      populateMonthOptions();
      renderFilteredTable();
    });

  document
    .getElementById("filter-month")
    .addEventListener("change", () => {
      populateDayOptions();
      renderFilteredTable();
    });

  document
    .getElementById("filter-day")
    .addEventListener("change", renderFilteredTable);

  document
    .getElementById("filter-max-amount")
    .addEventListener("input", renderFilteredTable);

  document
    .getElementById("clear-filters")
    .addEventListener("click", clearFilters);
}

initFiltersPage();
