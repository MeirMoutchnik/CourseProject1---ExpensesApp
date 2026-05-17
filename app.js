function loadExpenses() {
  let expenses = JSON.parse(localStorage.getItem("expenses"));
  if (expenses == null) {
    expenses = [];
  }
document.getElementById("expense-table-body").innerHTML = "";
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
  document.getElementById("expense-table-body").appendChild(row);
}); 
}

loadExpenses();

function addExpense(e) {
  e.preventDefault();
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let category = document.getElementById("category-select").value;
  let description = document.getElementById("description").value;
  let amount = document.getElementById("amount").value;
  let date = document.getElementById("date").value;
  let expense = { category, description, amount, date };
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  document.getElementById("expense-form").reset();
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
  else {
    alert("The expense was not deleted");
  }
}

function editExpense(index) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let expense = expenses[index];
  document.getElementById("category-select").value = expense.category;
  document.getElementById("description").value = expense.description;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("date").value = expense.date;
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  loadExpenses();
}

