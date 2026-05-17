(function () {
  const tbody = document.getElementById("expense-table-body");
  const form = document.getElementById("expense-form");
  const categorySelect = document.getElementById("category-select");
  const customWrap = document.getElementById("category-custom-wrap");
  const categoryInput = document.getElementById("category");

  function loadExpenses() {
    if (!tbody) return;

    const totalRow = tbody.querySelector(".total-row");
    if (!totalRow) return;

    tbody.querySelectorAll("tr:not(.total-row)").forEach((row) => row.remove());

    let expenses = JSON.parse(localStorage.getItem("expenses"));
    if (expenses == null) {
      expenses = [];
    }

    let total = 0;
    expenses.forEach((expense, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${expense.category}</td>
        <td>${expense.description}</td>
        <td>${expense.amount}</td>
        <td>${expense.date}</td>
        <td><button type="button" class="edit-btn" data-index="${index}">Edit</button></td>
        <td><button type="button" class="delete-btn" data-index="${index}">Delete</button></td>
      `;
      total += Number(expense.amount) || 0;
      tbody.insertBefore(row, totalRow);
    });

    const totalAmountCell = totalRow.querySelector(".total-amount");
    if (totalAmountCell) {
      totalAmountCell.textContent = total;
    }
  }

  function addExpense(e) {
    e.preventDefault();

    if (categorySelect?.value === "other" && categoryInput) {
      const v = categoryInput.value.trim();
      if (!v) {
        categoryInput.setCustomValidity("Please enter a category.");
        categoryInput.reportValidity();
        return;
      }
      categoryInput.setCustomValidity("");
    }

    let expenses = JSON.parse(localStorage.getItem("expenses"));
    if (expenses == null) {
      expenses = [];
    }

    const category =
      categorySelect?.value === "other" && categoryInput?.value.trim()
        ? categoryInput.value.trim()
        : categorySelect?.value ?? "";

    const expense = {
      category,
      description: document.getElementById("description").value,
      amount: document.getElementById("amount").value,
      date: document.getElementById("date").value,
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    form.reset();
    syncCategoryOther();
    loadExpenses();
  }

  function deleteExpense(index) {
    let expenses = JSON.parse(localStorage.getItem("expenses"));
    if (expenses == null) {
      expenses = [];
    }
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    loadExpenses();
  }

  function editExpense(index) {
    let expenses = JSON.parse(localStorage.getItem("expenses"));
    if (expenses == null) {
      expenses = [];
    }
    const expense = expenses[index];
    if (!expense) return;

    if (categorySelect) categorySelect.value = expense.category;
    document.getElementById("description").value = expense.description;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("date").value = expense.date;
    syncCategoryOther();
    deleteExpense(index);
  }

  function syncCategoryOther() {
    if (!categorySelect || !customWrap || !categoryInput) return;

    const isOther = categorySelect.value === "other";
    customWrap.hidden = !isOther;
    categoryInput.required = isOther;
    categoryInput.disabled = !isOther;
    if (!isOther) {
      categoryInput.value = "";
      categoryInput.setCustomValidity("");
    }
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      const editBtn = e.target.closest(".edit-btn");
      if (deleteBtn) {
        deleteExpense(Number(deleteBtn.dataset.index));
      } else if (editBtn) {
        editExpense(Number(editBtn.dataset.index));
      }
    });
  }

  if (form) {
    form.addEventListener("submit", addExpense);
  }

  if (categorySelect && customWrap && categoryInput) {
    categorySelect.addEventListener("change", syncCategoryOther);
    categoryInput.addEventListener("input", () => {
      categoryInput.setCustomValidity("");
    });
    syncCategoryOther();
  }

  loadExpenses();
})();
