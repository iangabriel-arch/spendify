let budget = 0;
let expenses = [];
let chart = null;
let searchQuery = '';

const catColors = {
  food: '#4ade80',
  transport: '#60a5fa',
  housing: '#fb923c',
  entertainment: '#e879f9',
  health: '#f87171',
  other: '#a1a1aa'
};

const budgetInput = document.getElementById('budgetInput');
const nameInput = document.getElementById('nameInput');
const amountInput = document.getElementById('amountInput');
const categoryInput = document.getElementById('categoryInput');
const expenseList = document.getElementById('expenseList');
const budgetDisplay = document.getElementById('budgetDisplay');
const spentDisplay = document.getElementById('spentDisplay');
const remainingDisplay = document.getElementById('remainingDisplay');
const searchInput = document.getElementById('searchInput');

async function fetchAdvice() {
  try {
    const res = await fetch('https://api.adviceslip.com/advice');
    const data = await res.json();
    let advice = data.slip.advice;
    const totalSpent = expenses.reduce((t, e) => t + e.amount, 0);
    if (totalSpent > budget && budget > 0) {
      advice = "You're over budget. Cut down on spending!";
    }
    document.getElementById('adviceText').textContent = '💬 ' + advice;
  } catch {
    document.getElementById('adviceText').textContent = 'Track your spending daily 💰';
  }
}

searchInput.addEventListener('input', function(e) {
  searchQuery = e.target.value.toLowerCase();
  renderExpenses();
});

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('del-btn')) {
    const id = parseInt(e.target.getAttribute('data-id'));
    deleteExpense(id);
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    handleAdd();
  }
});

function handleAdd() {
  const budgetVal = parseFloat(budgetInput.value);
  if (!isNaN(budgetVal) && budgetVal >= 0) {
    budget = budgetVal;
  }

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (name === '') {
    alert('Please enter an expense name');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  const newExpense = {
    id: Date.now(),
    name: name,
    amount: amount,
    category: category
  };

  expenses.push(newExpense);
  nameInput.value = '';
  amountInput.value = '';
  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(function(expense) {
    return expense.id !== id;
  });
  render();
}

function updateSummary() {
  const totalSpent = expenses.reduce(function(total, expense) {
    return total + expense.amount;
  }, 0);

  const remaining = budget - totalSpent;

  budgetDisplay.textContent = 'KSh' + budget.toFixed(2);
  spentDisplay.textContent = 'KSh' + totalSpent.toFixed(2);
  remainingDisplay.textContent = 'KSh' + remaining.toFixed(2);

  if (remaining < 0) {
    remainingDisplay.style.color = '#f87171';
  } else {
    remainingDisplay.style.color = '#4ade80';
  }
}

function renderExpenses() {
  const filteredExpenses = expenses.filter(function(expense) {
    return (
      expense.name.toLowerCase().includes(searchQuery) ||
      expense.category.toLowerCase().includes(searchQuery)
    );
  });

  if (expenses.length === 0) {
    expenseList.innerHTML = '<p id="emptyMsg">No expenses yet. Add one above!</p>';
    return;
  }

  if (filteredExpenses.length === 0) {
    expenseList.innerHTML = '<p id="emptyMsg">No matching expenses found</p>';
    return;
  }

  expenseList.innerHTML = filteredExpenses.map(function(expense) {
    return `
      <div class="expense-item">
        <div class="expense-left">
          <span class="badge badge-${expense.category}">${expense.category}</span>
          <span class="expense-name">${expense.name}</span>
        </div>
        <div class="expense-right">
          <span class="expense-amount">-KSh${expense.amount.toFixed(2)}</span>
          <button class="del-btn" data-id="${expense.id}">x</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderChart() {
  const totals = {};
  expenses.forEach(function(expense) {
    if (totals[expense.category]) {
      totals[expense.category] += expense.amount;
    } else {
      totals[expense.category] = expense.amount;
    }
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map(function(label) {
    return catColors[label];
  });

  const legendEl = document.getElementById('legend');

  if (labels.length === 0) {
    legendEl.innerHTML = '';
  } else {
    legendEl.innerHTML = labels.map(function(label, index) {
      return `
        <span class="legend-item">
          <span class="legend-dot" style="background:${colors[index]}"></span>
          ${label} — KSh${totals[label].toFixed(2)}
        </span>
      `;
    }).join('');
  }

  if (chart) {
    chart.destroy();
  }

  if (labels.length === 0) return;

  const ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function render() {
  updateSummary();
  renderExpenses();
  renderChart();
  fetchAdvice();
}

fetchAdvice();
render();