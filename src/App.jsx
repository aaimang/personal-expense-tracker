import { useState, useEffect } from 'react'
import { DollarSign, Plus, Trash2, ShoppingBag, Wallet } from 'lucide-react'

// ---- Color map: gives each category a unique color ----
const categoryColors = {
  Food: { bg: 'bg-brand-500/15', text: 'text-brand-400' },
  Transport: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Shopping: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
}

// Fallback color if a category doesn't have one assigned
const defaultColor = { bg: 'bg-gray-500/15', text: 'text-gray-400' }

function App() {
  // ---- STATE: the app's memory ----

  // What the user is currently typing in each input field
  const [name, setName] = useState('')       
  const [price, setPrice] = useState('')     
  const [category, setCategory] = useState('') 

  // The list of all expenses - loaded directly from localStorage at start
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('spendwise_expenses')
    return saved ? JSON.parse(saved) : []
  })

  // The list of available categories - loaded directly from localStorage at start
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('spendwise_categories')
    return saved ? JSON.parse(saved) : ['Food', 'Transport', 'Shopping']
  })

  // ---- PERSISTENCE: Save data whenever it changes ----
  useEffect(() => {
    localStorage.setItem('spendwise_expenses', JSON.stringify(expenses))
    localStorage.setItem('spendwise_categories', JSON.stringify(categories))
  }, [expenses, categories])

  // ---- CALCULATED VALUE: total spent ----
  // This adds up the price of every expense in the list
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.price, 0)

  // ---- HANDLER: Add Expense ----
  function handleAddExpense() {
    // Don't add if fields are empty or price is zero/negative
    if (!name.trim() || !price || parseFloat(price) <= 0 || !category) return

    const newExpense = {
      id: Date.now(),
      name: name.trim(),
      price: parseFloat(price),
      category: category,
      completed: false, // Start as not complete
    }

    setExpenses([...expenses, newExpense])
    setName('')
    setPrice('')
    setCategory('')
  }

  // ---- HANDLER: Form Submit ----
  function handleSubmit(e) {
    e.preventDefault() // Prevents the browser from refreshing the page
    handleAddExpense()
  }

  // ---- HANDLER: Toggle Complete ----
  function handleToggleComplete(id) {
    const updated = expenses.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setExpenses(updated)
  }

  // ---- HANDLER: Delete Expense ----
  function handleDeleteExpense(id) {
    const updatedExpenses = expenses.filter(expense => expense.id !== id)
    setExpenses(updatedExpenses)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8 sm:py-12">

      {/* ===== OUTER CONTAINER — max width for mobile-friendly layout ===== */}
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* ===== HEADER — App title + subtitle ===== */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              SpendWise Mini
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Track your daily spending by category
          </p>
        </header>

        {/* ===== TOTAL SPENT CARD — updates live as expenses are added ===== */}
        <section
          id="total-card"
          className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-6 text-center shadow-lg shadow-brand-500/20"
        >
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-1">
            Total Spent
          </p>
          <p className="text-4xl font-extrabold text-white">
            RM {totalSpent.toFixed(2)}
          </p>
        </section>

        {/* ===== ADD EXPENSE FORM — Now using a <form> for better accessibility ===== */}
        <section
          id="add-form"
          className="rounded-2xl bg-surface-card/80 backdrop-blur-sm border border-white/5 p-5"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-white">
              Add Expense
            </h2>

            {/* Item Name input — controlled by "name" state */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-name" className="text-xs font-medium text-gray-400">
                Item Name
              </label>
              <input
                id="item-name"
                type="text"
                placeholder="e.g. Nasi Lemak"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-surface/80 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Price input — controlled by "price" state */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-price" className="text-xs font-medium text-gray-400">
                Price (RM)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="item-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl bg-surface/80 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {/* Category dropdown — controlled by "category" state */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-category" className="text-xs font-medium text-gray-400">
                Category
              </label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-surface/80 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Add button — calls handleSubmit when clicked */}
            <button
              id="add-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold py-3.5 text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              disabled={!name.trim() || !price || parseFloat(price) <= 0 || !category}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </form>
        </section>

        {/* ===== EXPENSE LIST ===== */}
        <section id="expense-list">
          <h2 className="text-base font-semibold text-white mb-3 px-1">
            Recent Expenses
          </h2>

          {/* Show empty state if no expenses, otherwise show the list */}
          {expenses.length === 0 ? (
            <div className="rounded-2xl bg-surface-card/80 backdrop-blur-sm border border-white/5 p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500">
                No expenses yet. Add one above!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {expenses.map((expense) => {
                const color = categoryColors[expense.category] || defaultColor
                return (
                  <div
                    key={expense.id}
                    className={`rounded-xl backdrop-blur-sm border border-white/5 px-4 py-3 flex items-center justify-between transition-all duration-300
                      ${expense.completed 
                        ? 'bg-surface/20 opacity-40' 
                        : 'bg-surface-card/80 opacity-100 shadow-sm shadow-black/20'
                      }`}
                  >
                    <div 
                      className="flex flex-col gap-1 cursor-pointer flex-grow py-1"
                      onClick={() => handleToggleComplete(expense.id)}
                    >
                      <span className={`text-sm font-semibold transition-all leading-tight ${expense.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {expense.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${expense.completed ? 'bg-gray-500/10 text-gray-500' : color.bg + ' ' + color.text} font-bold uppercase tracking-wider`}>
                          {expense.category}
                        </span>
                        <span className={`text-xs ${expense.completed ? 'text-gray-600' : 'text-gray-400'} font-medium`}>
                          RM {expense.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer group"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="text-center text-[10px] text-gray-700 pb-6 uppercase tracking-widest font-bold">
          SpendWise Mini · Local Storage active
        </footer>

      </div>
    </div>
  )
}

export default App
