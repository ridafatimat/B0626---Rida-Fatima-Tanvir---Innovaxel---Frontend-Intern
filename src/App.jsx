import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
  "Food",
  "Utilities",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Other"
];

const emptyForm = {
  title: "",
  amount: "",
  category: "Food",
  date: "",
  notes: ""
};

function App() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Please enter the expense title.");
      return false;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter an amount greater than 0.");
      return false;
    }

    if (!formData.date) {
      alert("Please select a date.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const expensePayload = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes.trim()
    };

    if (editingId) {
      const updatedExpenses = expenses.map((expense) => {
        if (expense.id === editingId) {
          return {
            ...expensePayload,
            id: editingId
          };
        }

        return expense;
      });

      setExpenses(updatedExpenses);
    } else {
      const newExpense = {
        ...expensePayload,
        id: crypto.randomUUID()
      };

      setExpenses([...expenses, newExpense]);
    }

    resetForm();
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = (id) => {
    const shouldDelete = confirm("Are you sure you want to delete this expense?");

    if (!shouldDelete) {
      return;
    }

    const remainingExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(remainingExpenses);
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const categoryMatches =
          categoryFilter === "All" || expense.category === categoryFilter;

        const startDateMatches =
          !startDate || expense.date >= startDate;

        const endDateMatches =
          !endDate || expense.date <= endDate;

        return categoryMatches && startDateMatches && endDateMatches;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, categoryFilter, startDate, endDate]);

  const totalSpent = filteredExpenses.reduce((total, expense) => {
    return total + expense.amount;
  }, 0);

  const categoryTotals = filteredExpenses.reduce((totals, expense) => {
    if (!totals[expense.category]) {
      totals[expense.category] = 0;
    }

    totals[expense.category] += expense.amount;
    return totals;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Spending",
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#4f46e5",
          "#16a34a",
          "#f97316",
          "#dc2626",
          "#0891b2",
          "#9333ea",
          "#64748b"
        ],
        borderWidth: 1
      }
    ]
  };

  const clearFilters = () => {
    setCategoryFilter("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <main className="app">
      <section className="hero-section">
        <div>
          <p className="small-heading">Personal Expense Tracking Service</p>
          <h1>Expense Tracker</h1>
          <p className="hero-text">
            Track your spending, manage expenses, and view a simple visual
            breakdown of where your money goes.
          </p>
        </div>

        <div className="total-card">
          <span>Total Spent</span>
          <strong>PKR {totalSpent.toLocaleString()}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h2>{editingId ? "Edit Expense" : "Add New Expense"}</h2>

          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Dinner with friends"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                name="amount"
                placeholder="2200"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Optional notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="button-row full-width">
              <button type="submit" className="primary-button">
                {editingId ? "Update Expense" : "Add Expense"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Spending Summary</h2>

          {filteredExpenses.length > 0 ? (
            <>
              <div className="chart-container">
                <Pie data={chartData} />
              </div>

              <div className="summary-list">
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <div className="summary-item" key={category}>
                    <span>{category}</span>
                    <strong>PKR {amount.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-message">
              No expenses available for summary.
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>All Expenses</h2>
            <p>Expenses are shown from most recent to oldest.</p>
          </div>
        </div>

        <div className="filters">
          <div className="form-group">
            <label htmlFor="categoryFilter">Filter by Category</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <button className="secondary-button filter-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <p className="empty-message">No expenses found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>PKR {expense.amount.toLocaleString()}</td>
                    <td>
                      <span className="category-badge">
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.date}</td>
                    <td>{expense.notes || "No notes"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="small-button"
                          onClick={() => handleEdit(expense)}
                        >
                          Edit
                        </button>

                        <button
                          className="small-button danger-button"
                          onClick={() => handleDelete(expense.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;