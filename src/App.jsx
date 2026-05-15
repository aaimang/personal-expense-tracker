import { useState, useEffect, useRef } from 'react'
import {
  DollarSign, Plus, Trash2, ShoppingBag, Wallet,
  Download, ChevronLeft, ChevronRight, Settings2,
  Check, X, GripVertical, Pencil,
} from 'lucide-react'

import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

// Default categories with icon, color, and a stable numeric id.
// These are only used the very first time the app loads (no localStorage yet).
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food',      icon: '🍔', color: '#a78bfa' },
  { id: 2, name: 'Transport', icon: '🚗', color: '#34d399' },
  { id: 3, name: 'Shopping',  icon: '🛍️', color: '#fbbf24' },
]

// Emoji palette shown in the icon-picker popover.
// Grouped loosely so it's easy to scan.
const EMOJI_OPTIONS = [
  '🍔','🍜','🍕','🥗','☕','🍰','🛒',
  '🚗','🚌','✈️','🚂','⛽','🛵',
  '🛍️','👗','👟','💄','🎮','📱','💻',
  '🏠','💡','🌊','💊','🏋️','🎵','🎬',
  '📚','💰','🎁','🐶','✂️','🔧','📦',
]

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Look up a category object by name from the categories array.
// Falls back to a neutral grey style if not found.
function getCatStyle(categories, name) {
  return categories.find(c => c.name === name) || { icon: '•', color: '#9ca3af' }
}

// Attach each chart entry's fill color from its matching category object.
function withColors(data, categories) {
  return data.map(entry => ({
    ...entry,
    fill: getCatStyle(categories, entry.name).color,
  }))
}

// Build pie chart data grouped by category.
function buildChartData(expenses) {
  if (expenses.length === 0) return []
  const totals = {}
  expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.price
  })
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)
  return Object.entries(totals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    percent: Math.round((value / grandTotal) * 100),
  }))
}

// Filter expenses to the selected timeframe window.
// Uses exp.date if present (new), falls back to exp.id (old expenses without date field).
function filterByTimeframe(expenses, timeframe, selectedMonth, selectedYear) {
  return expenses.filter(exp => {
    const date = new Date(exp.date || exp.id)
    if (timeframe === 'month') {
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    }
    if (timeframe === 'year') return date.getFullYear() === selectedYear
    return true
  })
}

// Returns a datetime-local string (e.g. "2026-05-15T14:30") for the given Date.
// datetime-local inputs require this exact format.
function toDatetimeLocal(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Migrate old localStorage shape → new shape.
// Old: string[]  →  New: { id, name, icon, color }[]
function migrateCategories(raw) {
  if (!raw) return DEFAULT_CATEGORIES
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES
    // Already new shape?
    if (typeof parsed[0] === 'object' && parsed[0].id !== undefined) return parsed
    // Old string array — convert using default icons/colors where available
    return parsed.map((name, i) => {
      const def = DEFAULT_CATEGORIES.find(d => d.name === name)
      return def || { id: Date.now() + i, name, icon: '📌', color: '#9ca3af' }
    })
  } catch {
    return DEFAULT_CATEGORIES
  }
}

// ─────────────────────────────────────────────
// CHART TOOLTIP
// ─────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null
  const { name, value, percent } = payload[0].payload
  return (
    <div className="rounded-xl px-3 py-2 text-xs text-white shadow-xl" style={{ backgroundColor: '#1e1b2e', border: '1px solid rgba(255,255,255,0.12)' }}>
      <p className="font-bold">{name}</p>
      <p>RM {value.toFixed(2)} — {percent}%</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// ICON PICKER POPOVER
// ─────────────────────────────────────────────
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-lg glass-inner flex items-center justify-center text-base cursor-pointer hover:bg-white/10 transition-all"
        title="Pick icon"
      >
        {value}
      </button>
      {open && (
        <div className="absolute z-[999] bottom-10 left-0 rounded-xl p-2 grid grid-cols-7 gap-1 w-52 shadow-2xl" style={{ backgroundColor: '#1e1b2e', border: '1px solid rgba(255,255,255,0.12)' }}>
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onChange(emoji); setOpen(false) }}
              className={`w-6 h-6 flex items-center justify-center text-sm rounded hover:bg-white/10 cursor-pointer transition-all
                ${emoji === value ? 'bg-brand-500/30 ring-1 ring-brand-400' : ''}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
function App() {

  // ── FORM STATES ────────────────────────────
  const [name, setName]         = useState('')
  const [price, setPrice]       = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate]         = useState(() => toDatetimeLocal(new Date()))

  // ── EXPENSES ───────────────────────────────
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('spendwise_expenses')
    return saved ? JSON.parse(saved) : []
  })

  // ── CATEGORIES (new object shape) ──────────
  const [categories, setCategories] = useState(() =>
    migrateCategories(localStorage.getItem('spendwise_categories'))
  )

  // ── TIMEFRAME TOGGLE ───────────────────────
  const [timeframe, setTimeframe] = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [selectedYear,  setSelectedYear]  = useState(() => new Date().getFullYear())

  // ── INCOME MAP ─────────────────────────────
  const [incomeMap, setIncomeMap] = useState(() => {
    const saved = localStorage.getItem('spendwise_income_map')
    const map = saved ? JSON.parse(saved) : {}
    const legacy = localStorage.getItem('spendwise_income')
    if (legacy && legacy !== '') {
      const today = new Date()
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = legacy
      localStorage.removeItem('spendwise_income')
    }
    return map
  })

  // ── CATEGORY MANAGER UI STATE ──────────────
  const [managerOpen, setManagerOpen]   = useState(false)
  // id of the category currently being edited inline (null = none)
  const [editingId,   setEditingId]     = useState(null)
  // draft values while editing
  const [editName,    setEditName]      = useState('')
  const [editIcon,    setEditIcon]      = useState('')
  const [editColor,   setEditColor]     = useState('')
  // new-category row
  const [newName,     setNewName]       = useState('')
  const [newIcon,     setNewIcon]       = useState('📌')
  const [newColor,    setNewColor]      = useState('#a78bfa')
  // inline error messages
  const [editError,   setEditError]     = useState('')
  const [addError,    setAddError]      = useState('')
  // delete confirmation: id of category pending confirm (null = none)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  // drag state
  const dragIndexRef = useRef(null)

  // ── STICKY TOTAL BAR ───────────────────────
  // Becomes true once the total spent card scrolls out of view
  const totalCardRef = useRef(null)
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    const el = totalCardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── PERSISTENCE ────────────────────────────
  useEffect(() => {
    localStorage.setItem('spendwise_expenses',   JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('spendwise_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('spendwise_income_map', JSON.stringify(incomeMap))
  }, [incomeMap])

  // ── DERIVED VALUES ─────────────────────────
  const filteredExpenses   = filterByTimeframe(expenses, timeframe, selectedMonth, selectedYear)
  const totalSpentAll      = expenses.reduce((sum, e) => sum + e.price, 0)
  const totalSpentFiltered = filteredExpenses.reduce((sum, e) => sum + e.price, 0)
  const chartData          = buildChartData(filteredExpenses)

  const incomeKey    = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
  const monthlyIncome = incomeMap[incomeKey] || ''

  // In year view: sum all 12 monthly income entries for selectedYear
  const yearlyIncome = Array.from({ length: 12 }, (_, m) =>
    parseFloat(incomeMap[`${selectedYear}-${String(m + 1).padStart(2, '0')}`] || 0)
  ).reduce((a, b) => a + b, 0)

  const incomeValue = timeframe === 'year' ? yearlyIncome : (parseFloat(monthlyIncome) || 0)
  const balance       = incomeValue - totalSpentFiltered

  const timeframeLabel = timeframe === 'month'
    ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    : `Year ${selectedYear}`

  const today = new Date()
  const isCurrentPeriod = timeframe === 'month'
    ? selectedMonth === today.getMonth() && selectedYear === today.getFullYear()
    : selectedYear === today.getFullYear()

  // ── EXPENSE HANDLERS ───────────────────────
  function handleAddExpense() {
    if (!name.trim() || !price || parseFloat(price) <= 0 || !category) return
    setExpenses([...expenses, {
      id: Date.now(),
      date: date ? new Date(date).getTime() : Date.now(),
      name: name.trim(),
      price: parseFloat(price),
      category,
      completed: false,
    }])
    setName(''); setPrice(''); setCategory('')
    setDate(toDatetimeLocal(new Date())) // reset to now for next entry
  }

  function handleSubmit(e) { e.preventDefault(); handleAddExpense() }

  function handleToggleComplete(id) {
    setExpenses(expenses.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  function handleDeleteExpense(id) {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  // ── NAVIGATION HANDLERS ────────────────────
  function handlePrev() {
    if (timeframe === 'month') {
      if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
      else setSelectedMonth(m => m - 1)
    } else setSelectedYear(y => y - 1)
  }

  function handleNext() {
    if (isCurrentPeriod) return
    if (timeframe === 'month') {
      if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
      else setSelectedMonth(m => m + 1)
    } else setSelectedYear(y => y + 1)
  }

  function handleTimeframeChange(tf) {
    setTimeframe(tf)
    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  // ── PDF EXPORT ─────────────────────────────
  function handleDownloadPDF() {
    const doc = new jsPDF()
    doc.setFontSize(18); doc.setTextColor(40, 40, 40)
    doc.text('SpendWise Mini — Expense Report', 14, 20)
    doc.setFontSize(11); doc.setTextColor(100, 100, 100)
    doc.text(`Period: ${timeframeLabel}`, 14, 30)
    doc.setFontSize(12); doc.setTextColor(40, 40, 40)
    doc.text(`Monthly Income : RM ${incomeValue.toFixed(2)}`, 14, 44)
    doc.text(`Total Expenses : RM ${totalSpentFiltered.toFixed(2)}`, 14, 52)
    doc.text(`Balance        : RM ${balance.toFixed(2)}`, 14, 60)
    doc.setFontSize(11); doc.setTextColor(80, 80, 80)
    doc.text('Breakdown by Category:', 14, 72)
    autoTable(doc, {
      startY: 76,
      head: [['Category', '%', 'Amount']],
      body: chartData.length > 0
        ? chartData.map(d => [d.name, `${d.percent}%`, `RM ${d.value.toFixed(2)}`])
        : [['No data', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 10 },
    })
    const afterBreakdown = doc.lastAutoTable.finalY + 10
    doc.setFontSize(11); doc.setTextColor(80, 80, 80)
    doc.text('Expense Details:', 14, afterBreakdown)
    autoTable(doc, {
      startY: afterBreakdown + 4,
      head: [['Date', 'Item', 'Category', 'Price', 'Status']],
      body: filteredExpenses.length > 0
        ? filteredExpenses.map(exp => [
            new Date(exp.date || exp.id).toLocaleDateString(),
            exp.name, exp.category,
            `RM ${exp.price.toFixed(2)}`,
            exp.completed ? 'Done' : 'Active',
          ])
        : [['No expenses', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 10 },
    })
    doc.save(`SpendWise_${timeframeLabel.replace(' ', '_')}.pdf`)
  }

  // ── CATEGORY MANAGER HANDLERS ──────────────

  // Start editing a category row
  function startEdit(cat) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditIcon(cat.icon)
    setEditColor(cat.color)
    setEditError('')
    setDeleteConfirm(null)
  }

  // Confirm inline edit
  function confirmEdit(id) {
    const trimmed = editName.trim()
    if (!trimmed) { setEditError('Name cannot be empty.'); return }
    // Duplicate check — ignore self
    const duplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== id)
    if (duplicate) { setEditError('A category with that name already exists.'); return }

    // If the name changed, update all expenses that used the old name
    const oldCat = categories.find(c => c.id === id)
    if (oldCat && oldCat.name !== trimmed) {
      setExpenses(prev => prev.map(exp =>
        exp.category === oldCat.name ? { ...exp, category: trimmed } : exp
      ))
    }

    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, name: trimmed, icon: editIcon, color: editColor } : c
    ))
    setEditingId(null)
    setEditError('')
  }

  // Cancel editing
  function cancelEdit() { setEditingId(null); setEditError('') }

  // Add a new category
  function handleAddCategory() {
    const trimmed = newName.trim()
    if (!trimmed) { setAddError('Name cannot be empty.'); return }
    const duplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) { setAddError('A category with that name already exists.'); return }

    setCategories(prev => [...prev, {
      id: Date.now(),
      name: trimmed,
      icon: newIcon,
      color: newColor,
    }])
    setNewName('')
    setNewIcon('📌')
    setNewColor('#a78bfa')
    setAddError('')
  }

  // Request delete — show confirm if category is in use
  function requestDelete(id) {
    setDeleteConfirm(id)
    setEditingId(null)
  }

  // Confirm delete
  function confirmDelete(id) {
    const cat = categories.find(c => c.id === id)
    // Clear the category field if it was selected
    if (cat && category === cat.name) setCategory('')
    setCategories(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
  }

  // ── DRAG-AND-DROP REORDER ──────────────────
  function onDragStart(index) {
    dragIndexRef.current = index
  }

  function onDragOver(e, index) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    setCategories(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(index, 0, moved)
      dragIndexRef.current = index
      return next
    })
  }

  function onDragEnd() { dragIndexRef.current = null }

  // How many expenses use a given category name
  function usageCount(name) {
    return expenses.filter(e => e.category === name).length
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8 sm:py-12">

      {/* ── STICKY TOTAL BAR ──
          Slides in from the top once the main Total Spent card scrolls out of view.
          Solid background so page content never bleeds through while scrolling. */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out
          ${stickyVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{
          backgroundColor: '#0e0b1f',
          borderBottom: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(139,92,246,0.2)',
          // Push content below the iOS status bar (time, battery, notch)
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Total Spent</span>
          </div>
          <span className="text-base font-extrabold text-white">
            RM {totalSpentAll.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">

        {/* ── HEADER ── */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              SpendWise Mini
            </h1>
          </div>
          <p className="text-sm text-gray-400">Track your daily spending by category</p>
        </header>

        {/* ── TOTAL SPENT CARD ── */}
        <section ref={totalCardRef} className="glass rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-1">
            Total Spent (All Time)
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-white glow-text break-all">
            RM {totalSpentAll.toFixed(2)}
          </p>
        </section>

        {/* ── STATISTICS SECTION ── */}
        <section className="glass rounded-2xl p-5 flex flex-col gap-5">

          {/* Timeframe toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Statistics</h2>
            <div className="flex items-center gap-1 glass-inner rounded-xl p-1">
              {['month', 'year'].map(tf => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer
                    ${timeframe === tf
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'}`}
                >
                  {tf === 'month' ? 'Month' : 'Year'}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow navigation */}
          <div className="flex items-center justify-between -mt-3">
            <button onClick={handlePrev} aria-label="Previous period"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-xs font-semibold text-gray-300">{timeframeLabel}</p>
            <button onClick={handleNext} disabled={isCurrentPeriod} aria-label="Next period"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pie chart */}
          {chartData.length > 0 ? (
            <div className="w-full">
              {/* Donut chart — percentage-based radii so it scales on every screen */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={withColors(chartData, categories)}
                    cx="50%" cy="50%"
                    innerRadius="38%" outerRadius="62%"
                    paddingAngle={3} dataKey="value"
                  />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend rendered manually so it wraps cleanly on narrow screens */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {withColors(chartData, categories).map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span>{entry.name}</span>
                    <span className="text-gray-500">{entry.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
              <ShoppingBag className="w-8 h-8 opacity-30" />
              <span>No expenses for this {timeframe}</span>
            </div>
          )}

          {/* Income / Expenses / Balance */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1 glass-inner rounded-xl p-2.5">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                {timeframe === 'year' ? 'Total Income' : 'Income'}
              </span>
              {timeframe === 'year' ? (
                // Read-only: sum of all monthly incomes for this year
                <span className="text-xs font-bold text-emerald-400 truncate">
                  RM {yearlyIncome.toFixed(2)}
                </span>
              ) : (
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] text-gray-500">RM</span>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={monthlyIncome}
                    onChange={e => setIncomeMap(m => ({ ...m, [incomeKey]: e.target.value }))}
                    className="w-full pl-5 bg-transparent text-xs font-bold text-emerald-400 outline-none placeholder-gray-600"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 glass-inner rounded-xl p-2.5">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Expenses</span>
              <span className="text-xs font-bold text-white/80 truncate">
                RM {totalSpentFiltered.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-1 glass-inner rounded-xl p-2.5">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Balance</span>
              <span className={`text-xs font-bold truncate ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                RM {balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* PDF download */}
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 rounded-xl glass-inner hover:bg-white/10 text-white/70 hover:text-white font-semibold py-3 text-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF — {timeframeLabel}
          </button>
        </section>

        {/* ── ADD EXPENSE FORM ── */}
        <section className="glass rounded-2xl p-5 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-white">Add Expense</h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-name" className="text-xs font-medium text-gray-400">Item Name</label>
              <input
                id="item-name" type="text" placeholder="e.g. Nasi Lemak"
                value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-xl glass-inner px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/25 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-price" className="text-xs font-medium text-gray-400">Price (RM)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="item-price" type="number" placeholder="0.00" min="0" step="0.01"
                  value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full rounded-xl glass-inner pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/25 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-category" className="text-xs font-medium text-gray-400">Category</label>
              <select
                id="item-category" value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl glass-inner px-4 py-3 text-sm text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/25 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-date" className="text-xs font-medium text-gray-400">Date & Time</label>
              {/* overflow-hidden + min-w-0 prevents the native datetime widget from
                  expanding outside the card on iOS Safari */}
              <div className="w-full min-w-0 overflow-hidden rounded-xl glass-inner focus-within:ring-2 focus-within:ring-brand-500/25 focus-within:border-brand-400 transition-all">
                <input
                  id="item-date"
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full min-w-0 bg-transparent px-4 py-3 text-xs text-white outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              id="add-btn" type="submit"
              disabled={!name.trim() || !price || parseFloat(price) <= 0 || !category}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold py-3.5 text-sm transition-all cursor-pointer glow-brand disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </form>
        </section>

        {/* ════════════════════════════════════════
            MANAGE CATEGORIES SECTION
            ════════════════════════════════════════ */}
        <section className="glass rounded-2xl">

          {/* Collapsible header */}
          <button
            type="button"
            onClick={() => setManagerOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-white cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-brand-400" />
              <span className="text-base font-semibold">Manage Categories</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${managerOpen ? 'rotate-90' : ''}`}
            />
          </button>

          {managerOpen && (
            <div className="px-5 pb-5 flex flex-col gap-3">

              {/* ── Existing category rows ── */}
              {categories.map((cat, index) => {
                const inUse = usageCount(cat.name)
                const isEditing = editingId === cat.id
                const pendingDelete = deleteConfirm === cat.id

                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={e => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className="glass-inner rounded-xl px-3 py-2.5 flex flex-col gap-2"
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-2">

                      {/* Drag handle */}
                      <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0" />

                      {isEditing ? (
                        <>
                          {/* Icon picker */}
                          <IconPicker value={editIcon} onChange={setEditIcon} />

                          {/* Color picker */}
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <div
                              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer"
                              style={{ backgroundColor: editColor }}
                            />
                            <input
                              type="color"
                              value={editColor}
                              onChange={e => setEditColor(e.target.value)}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              title="Pick color"
                            />
                          </div>

                          {/* Name input */}
                          <input
                            type="text"
                            value={editName}
                            onChange={e => { setEditName(e.target.value); setEditError('') }}
                            onKeyDown={e => { if (e.key === 'Enter') confirmEdit(cat.id); if (e.key === 'Escape') cancelEdit() }}
                            autoFocus
                            className="flex-1 bg-transparent text-sm text-white outline-none border-b border-brand-400 pb-0.5 min-w-0"
                          />

                          {/* Confirm / Cancel */}
                          <button type="button" onClick={() => confirmEdit(cat.id)}
                            className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-400/10 cursor-pointer transition-all flex-shrink-0">
                            <Check className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={cancelEdit}
                            className="p-1 rounded-lg text-gray-400 hover:bg-white/10 cursor-pointer transition-all flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Color swatch (read-only, click to edit) */}
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />

                          {/* Icon */}
                          <span className="text-base leading-none">{cat.icon}</span>

                          {/* Name */}
                          <span className="flex-1 text-sm text-white font-medium truncate">{cat.name}</span>

                          {/* Usage badge */}
                          {inUse > 0 && (
                            <span className="text-[10px] text-gray-500 font-medium flex-shrink-0">
                              {inUse} expense{inUse > 1 ? 's' : ''}
                            </span>
                          )}

                          {/* Edit button */}
                          <button type="button" onClick={() => startEdit(cat)}
                            className="p-1 rounded-lg text-gray-400 hover:text-brand-400 hover:bg-brand-400/10 cursor-pointer transition-all flex-shrink-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button type="button" onClick={() => requestDelete(cat.id)}
                            className="p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-all flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Edit error */}
                    {isEditing && editError && (
                      <p className="text-[11px] text-red-400 pl-8">{editError}</p>
                    )}

                    {/* Delete confirmation */}
                    {pendingDelete && (
                      <div className="flex items-center gap-2 pl-8 text-xs">
                        <span className="text-gray-400">
                          {inUse > 0
                            ? `${inUse} expense${inUse > 1 ? 's' : ''} use this. Delete anyway?`
                            : 'Delete this category?'}
                        </span>
                        <button type="button" onClick={() => confirmDelete(cat.id)}
                          className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 cursor-pointer transition-all text-[11px]">
                          Delete
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-0.5 rounded-md glass-inner text-gray-400 font-semibold hover:bg-white/10 cursor-pointer transition-all text-[11px]">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* ── Add new category row ── */}
              <div className="glass-inner rounded-xl px-3 py-2.5 flex flex-col gap-2">
                <div className="flex items-center gap-2">

                  {/* Spacer to align with drag handle column */}
                  <div className="w-4 flex-shrink-0" />

                  <IconPicker value={newIcon} onChange={setNewIcon} />

                  {/* Color picker */}
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer"
                      style={{ backgroundColor: newColor }}
                    />
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => { setNewColor(e.target.value); setAddError('') }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      title="Pick color"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="New category name…"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setAddError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none border-b border-white/10 focus:border-brand-400 pb-0.5 min-w-0 transition-all"
                  />

                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newName.trim()}
                    className="p-1 rounded-lg text-brand-400 hover:bg-brand-400/10 cursor-pointer transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {addError && (
                  <p className="text-[11px] text-red-400 pl-8">{addError}</p>
                )}
              </div>

              <p className="text-[10px] text-gray-600 text-center">
                Drag rows to reorder · Click <Pencil className="inline w-2.5 h-2.5 mx-0.5" /> to edit · Click color swatch or icon to change
              </p>
            </div>
          )}
        </section>

        {/* ── EXPENSE LIST ── */}
        <section>
          <h2 className="text-base font-semibold text-white mb-3 px-1">Recent Expenses</h2>

          {expenses.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500">No expenses yet. Add one above!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {expenses.map(expense => {
                const cat = getCatStyle(categories, expense.category)
                return (
                  <div
                    key={expense.id}
                    className={`rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-300
                      ${expense.completed
                        ? 'bg-white/2 border border-white/5 opacity-30 backdrop-blur-sm'
                        : 'glass shadow-sm shadow-black/20'}`}
                  >
                    <div
                      className="flex flex-col gap-1 cursor-pointer flex-grow py-1"
                      onClick={() => handleToggleComplete(expense.id)}
                    >
                      <span className={`text-sm font-semibold leading-tight transition-all truncate ${expense.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {expense.name}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category badge with dynamic icon + color */}
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"
                          style={{
                            backgroundColor: expense.completed ? 'rgba(107,114,128,0.1)' : `${cat.color}22`,
                            color: expense.completed ? '#6b7280' : cat.color,
                          }}
                        >
                          <span>{cat.icon}</span>
                          {expense.category}
                        </span>
                        <span className={`text-xs font-medium ${expense.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          RM {expense.price.toFixed(2)}
                        </span>
                        <span className={`text-[10px] ${expense.completed ? 'text-gray-600' : 'text-gray-500'}`}>
                          {new Date(expense.date || expense.id).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
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

        {/* ── FOOTER ── */}
        <footer className="text-center text-[10px] text-gray-700 pb-6 uppercase tracking-widest font-bold">
          SpendWise Mini · Local Storage active
        </footer>

      </div>
    </div>
  )
}

export default App
