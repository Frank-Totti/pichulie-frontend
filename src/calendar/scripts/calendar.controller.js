import { createLocalDate, showAlert, formatTime, switchView } from './shared.js'

export class CalendarController {
  constructor(taskManager = null) {
    this.taskManager = taskManager
    this.calendarDate = new Date()
    this.selectedDate = null
  }

  /**
   * Show calendar view
   */
  showCalendar() {
    console.log("showCalendar called")
    // La vista ya está cargada por el ViewLoader, solo necesitamos renderizar
    this.renderCalendar()
  }

  /**
   * Render the calendar
   */
  renderCalendar() {
    this.updateCalendarHeader()
    this.renderCalendarGrid()
  }

  /**
   * Update calendar header with current month and year
   */
  updateCalendarHeader() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    
    const monthElement = document.getElementById("calendarMonth")
    const yearElement = document.getElementById("calendarYear")
    
    if (monthElement && yearElement) {
      monthElement.textContent = months[this.calendarDate.getMonth()]
      yearElement.textContent = this.calendarDate.getFullYear()
    } else {
      console.error("Calendar header elements not found")
    }
  }

  /**
   * Render calendar grid with days
   */
  renderCalendarGrid() {
    const calendarGrid = document.getElementById("calendarGrid")
    
    if (!calendarGrid) {
      console.error("Calendar grid element not found")
      return
    }
    
    calendarGrid.innerHTML = ""

    const year = this.calendarDate.getFullYear()
    const month = this.calendarDate.getMonth()
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyCell = document.createElement("div")
      emptyCell.className = "calendar-day empty"
      calendarGrid.appendChild(emptyCell)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div")
      dayCell.className = "calendar-day"
      dayCell.textContent = day
      dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      // Check if this day has tasks
      const dateStr = dayCell.dataset.date
      const hasTasks = this.getTasksForDate(dateStr).length > 0
      if (hasTasks) {
        dayCell.classList.add("has-tasks")
      }

      // Highlight today
      const today = new Date()
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayCell.classList.add("today")
      }

      // Add click event
      dayCell.addEventListener("click", () => this.selectDate(dateStr, dayCell))
      
      calendarGrid.appendChild(dayCell)
    }
  }

  /**
   * Change calendar month
   * @param {number} direction - Direction to change month (-1 or 1)
   */
  changeCalendarMonth(direction) {
    this.calendarDate.setMonth(this.calendarDate.getMonth() + direction)
    this.renderCalendar()
  }

  /**
   * Select a date from calendar
   * @param {string} dateStr - Selected date string
   * @param {HTMLElement} dayElement - Clicked day element
   */
  selectDate(dateStr, dayElement) {
    console.log("Date selected:", dateStr)
    
    // Create local date to verify
    const localDate = createLocalDate(dateStr)
    console.log("Local date created:", localDate)
    console.log("Day of month:", localDate.getDate())
    
    // Remove previous selection
    document.querySelectorAll(".calendar-day").forEach(day => {
      day.classList.remove("selected")
    })

    // Add selection to clicked day
    dayElement.classList.add("selected")
    this.selectedDate = dateStr

    // Switch to task board view and filter by date
    this.switchToTaskBoardWithDate(dateStr)
  }

  /**
   * Show tasks for selected date
   * @param {string} dateStr - Date string
   */
  showTasksForDate(dateStr) {
    const selectedDateTasks = document.getElementById("selectedDateTasks")
    const selectedDateText = document.getElementById("selectedDateText")
    const selectedDateTaskList = document.getElementById("selectedDateTaskList")

    const tasks = this.getTasksForDate(dateStr)
    
    // Format date for display (fix timezone issue)
    const date = createLocalDate(dateStr)
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
    
    selectedDateText.textContent = formattedDate
    selectedDateTaskList.innerHTML = ""

    if (tasks.length === 0) {
      selectedDateTaskList.innerHTML = "<p style='text-align: center; color: #666; padding: 20px;'>No tasks for this date</p>"
    } else {
      tasks.forEach(task => {
        const taskCard = this.createTaskCard(task, task.status === "to do" ? "todo" : task.status === "in process" ? "inprocess" : "finished")
        selectedDateTaskList.appendChild(taskCard)
      })
    }

    selectedDateTasks.style.display = "block"
  }

  /**
   * Get tasks for a specific date
   * @param {string} dateStr - Date string
   * @returns {Array} Array of tasks for the date
   */
  getTasksForDate(dateStr) {
    if (!this.taskManager) {
      // Si no hay taskManager, intentar cargar desde localStorage
      try {
        const savedTasks = localStorage.getItem("taskManagerTasks")
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks)
          const allTasks = [...tasks.todo, ...tasks.inprocess, ...tasks.finished]
          return allTasks.filter(task => task.task_date === dateStr)
        }
      } catch (err) {
        console.error("Error loading tasks from localStorage:", err)
      }
      return []
    }
    
    const allTasks = [...this.taskManager.tasks.todo, ...this.taskManager.tasks.inprocess, ...this.taskManager.tasks.finished]
    return allTasks.filter(task => task.task_date === dateStr)
  }

  /**
   * Switch to task board with selected date
   * @param {string} dateStr - Selected date string
   */
  switchToTaskBoardWithDate(dateStr) {
    console.log("Switching to task board with date:", dateStr)
    
    if (this.taskManager) {
      // Si hay taskManager, usar el sistema original
      switchView("taskBoard")
      this.taskManager.currentDate = createLocalDate(dateStr)
      this.taskManager.updateDateDisplay()
      this.taskManager.updateHeaderDate()
      this.taskManager.renderTasks() // Use the main renderTasks method instead
    } else {
      // Si no hay taskManager, guardar la fecha seleccionada y redirigir al dashboard
      localStorage.setItem('selectedDate', dateStr)
      window.location.href = 'dashboard.html'
    }
    
    // Update navigation to show task board as active
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    
    // Find and activate the "Search by date" button (or create a visual indicator)
    const searchButton = Array.from(document.querySelectorAll(".nav-item")).find(item => {
      const span = item.querySelector('span')
      return span && span.textContent.trim() === "Search by date"
    })
    
    if (searchButton) {
      searchButton.classList.add("active")
    }
  }

  /**
   * Render tasks for selected date
   * @param {string} dateStr - Date string
   */
  renderTasksForDate(dateStr) {
    console.log("Rendering tasks for date:", dateStr)
    
    if (!this.taskManager) {
      console.log("No taskManager available, skipping task rendering")
      return
    }
    
    // Filter tasks by date
    const tasksForDate = {
      todo: this.taskManager.tasks.todo.filter(task => task.task_date === dateStr),
      inprocess: this.taskManager.tasks.inprocess.filter(task => task.task_date === dateStr),
      finished: this.taskManager.tasks.finished.filter(task => task.task_date === dateStr)
    }
    
    // Render filtered tasks
    Object.keys(tasksForDate).forEach((column) => {
      const taskList = document.querySelector(`[data-column="${column}"]`)
      if (taskList) {
        taskList.innerHTML = ""

        tasksForDate[column].forEach((task) => {
          const taskCard = this.createTaskCard(task, column)
          taskList.appendChild(taskCard)
        })
      }
    })
  }

  /**
   * Create task card element - delegates to TaskManager if available
   * @param {Object} task - Task object
   * @param {string} column - Column name
   * @returns {HTMLElement} Task card element
   */
  createTaskCard(task, column) {
    if (this.taskManager && this.taskManager.createTaskCard) {
      // Use the TaskManager's createTaskCard method if available
      return this.taskManager.createTaskCard(task, column)
    }
    
    // Fallback: create a simple task card for calendar display
    const card = document.createElement("div")
    card.className = "task-card"
    card.dataset.taskId = task._id || task.id
    card.dataset.column = column

    card.innerHTML = `
      <div class="task-header">
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-description">${task.detail || ''}</div>
          <div class="task-time">${task.time ? formatTime(task.time) : ''} ${task.remember ? '🔔' : ''}</div>
        </div>
      </div>
    `

    return card
  }
}

// Inicialización para cuando se carga la página del calendario
let calendarRetryCount = 0
const MAX_CALENDAR_RETRIES = 5

function initializeCalendarPage() {
  // Verificar si estamos en la página correcta
  if (!document.getElementById("calendarGrid")) {
    console.log("Not on calendar page, skipping calendar initialization")
    return
  }
  
  console.log("Initializing calendar page...")
  
  // Verificar que los elementos necesarios estén disponibles
  const requiredElements = ['calendarMonth', 'calendarYear', 'calendarGrid', 'prevMonth', 'nextMonth']
  const missingElements = requiredElements.filter(id => !document.getElementById(id))
  
  if (missingElements.length > 0) {
    calendarRetryCount++
    console.warn(`Some required elements not found (attempt ${calendarRetryCount}/${MAX_CALENDAR_RETRIES}):`, missingElements)
    
    if (calendarRetryCount < MAX_CALENDAR_RETRIES) {
      // Reintentar después de un breve delay
      setTimeout(initializeCalendarPage, 200)
      return
    } else {
      console.error("Max retries reached for calendar initialization. Elements still missing:", missingElements)
      return
    }
  }
  
  const calendarController = new CalendarController()
  window.calendarController = calendarController
  
  // Agregar event listeners para los botones de navegación
  const prevMonth = document.getElementById("prevMonth")
  const nextMonth = document.getElementById("nextMonth")
  
  if (prevMonth) {
    prevMonth.addEventListener("click", () => calendarController.changeCalendarMonth(-1))
  }
  
  if (nextMonth) {
    nextMonth.addEventListener("click", () => calendarController.changeCalendarMonth(1))
  }
  
  calendarController.showCalendar()
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalendarPage)
} else {
  // Si el DOM ya está listo, esperar un poco más para asegurar que todos los elementos estén disponibles
  setTimeout(initializeCalendarPage, 100)
}
