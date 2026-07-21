const PREDEFINED_CATEGORIES = [
  "food",
  "transport",
  "housing",
  "utilities",
  "entertainment",
];

let editingIndex = null;

function loadExpenses() {
  const tableBody = document.getElementById("expense-table-body");
  if (!tableBody) return;

  let expenses = JSON.parse(localStorage.getItem("expenses"));
  if (expenses == null) {
    expenses = [];
  }
  tableBody.innerHTML = "";
  expenses.forEach((expense, index) => {
    let row = document.createElement("tr");
    row.innerHTML = `
  <td>${expense.category}</td>
  <td>${expense.description}</td>
  <td>${expense.amount}</td>
  <td>${expense.date}</td>
  <td><button class="edit-btn" onclick="editExpense(${index})">Edit</button></td>
  <td><button class="delete-btn" onclick="deleteExpense(${index})">Delete</button></td>
  `;
    tableBody.appendChild(row);
  });
  let totalRow = document.createElement("tr");
  totalRow.className = "total-row";
  totalRow.innerHTML = `
  <td class="total-label">Total</td>
  <td class="total-amount" colspan="5">${expenses.reduce((total, expense) => total + Number(expense.amount), 0)}</td>
  `;
  tableBody.appendChild(totalRow);
}

function toggleOtherCategory() {
  const select = document.getElementById("category-select");
  if (!select) return;

  const isOther = select.value === "other";
  const wrap = document.getElementById("other-category-wrap");
  const input = document.getElementById("other-category");
  const dateWrap = document.getElementById("date-wrap");
  wrap.hidden = !isOther;
  input.required = isOther;
  dateWrap.classList.toggle("full-width", isOther);
  if (!isOther) {
    input.value = "";
  }
}

function getCategory() {
  const select = document.getElementById("category-select");
  if (select.value === "other") {
    return document.getElementById("other-category").value.trim();
  }
  return select.value;
}

function setCategoryFields(category) {
  const select = document.getElementById("category-select");
  const otherInput = document.getElementById("other-category");
  if (PREDEFINED_CATEGORIES.includes(category)) {
    select.value = category;
    otherInput.value = "";
  } else {
    select.value = "other";
    otherInput.value = category;
  }
  toggleOtherCategory();
}

function addExpense(e) {
  e.preventDefault();
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  if (
    document.getElementById("category-select").value === "other" &&
    !document.getElementById("other-category").value.trim()
  ) {
    alert("Please specify the category");
    return;
  }

  let category = getCategory();
  let description = document.getElementById("description").value;
  let amount = document.getElementById("amount").value;
  let date = document.getElementById("date").value;

  if (amount < 0) {
    alert("The amount must be positive");
    return;
  }

  if (amount > 100000) {
    alert("The amount must be less than 100000");
    return;
  }

  if (date > new Date().toISOString().split("T")[0]) {
    alert("The date must be today or before today");
    return;
  }

  let expense = { category, description, amount, date };
  if (editingIndex !== null) {
    expenses[editingIndex] = expense;
    editingIndex = null;
  } else {
    expenses.push(expense);
  }
  localStorage.setItem("expenses", JSON.stringify(expenses));
  document.getElementById("expense-form").reset();
  toggleOtherCategory();
  document.getElementById("submit").value = "Add Expense";
  loadExpenses();
}

function deleteExpense(index) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let ok = confirm("Are you sure you want to delete this expense?");
  if (ok) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    loadExpenses();
  }
}

function editExpense(index) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let expense = expenses[index];
  setCategoryFields(expense.category);
  document.getElementById("description").value = expense.description;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("date").value = expense.date;
  editingIndex = index;
  document.getElementById("submit").value = "Update Expense";
}

const categorySelect = document.getElementById("category-select");
if (categorySelect) {
  categorySelect.addEventListener("change", toggleOtherCategory);
  toggleOtherCategory();
  loadExpenses();
}
