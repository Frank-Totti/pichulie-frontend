// Shared utilities and functions

/**
 * Create a date in local timezone to avoid UTC conversion issues
 * @param {string} dateStr - Date string in format YYYY-MM-DD
 * @returns {Date} Local date object
 */
export function createLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

/**
 * Show custom alert with different types and positions
 * @param {string} message - Alert message
 * @param {string} type - Alert type: 'error', 'success', 'info'
 * @param {string} position - Alert position: 'modal', 'corner', 'dashboard'
 */
export function showAlert(message, type = "info", position = "modal") {
  // Remove existing alerts
  const existingAlert = document.querySelector('.custom-alert')
  if (existingAlert) {
    existingAlert.remove()
  }

  // Create alert element
  const alert = document.createElement('div')
  alert.className = `custom-alert custom-alert-${type} custom-alert-${position}`
  alert.innerHTML = `
    <div class="alert-content">
      <div class="alert-icon">
        ${type === 'error' ? '' : type === 'success' ? '' : 'ℹ️'}
      </div>
      <div class="alert-message">${message}</div>
      <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `

  // Position the alert based on context
  if (position === "modal") {
    // Show alert near the modal
    const modal = document.getElementById("taskModal")
    if (modal) {
      modal.appendChild(alert)
    } else {
      document.body.appendChild(alert)
    }
  } else if (position === "dashboard") {
    // Show alert in the center of the dashboard
    const dashboard = document.getElementById("taskBoardView")
    if (dashboard) {
      dashboard.appendChild(alert)
    } else {
      document.body.appendChild(alert)
    }
  } else {
    // Show alert in top-right corner
    document.body.appendChild(alert)
  }

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove()
    }
  }, 5000)
}

/**
 * Format time from 24-hour to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (H:MM AM/PM)
 */
export function formatTime(time24) {
  if (!time24) return ""
  const [hours, minutes] = time24.split(":")
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? "PM" : "AM"
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Load view content dynamically
 * @param {string} viewName - Name of the view to load
 * @returns {Promise<string>} HTML content of the view
 */
async function loadViewContent(viewName) {
  const viewMap = {
    allTasks: './pages/calendar.html',
    trash: './pages/trash.html',
    about: './pages/about.html',
  }
  
  const viewPath = viewMap[viewName]
  if (!viewPath) return null
  
  try {
    console.log('Loading view:', viewName, 'from path:', viewPath)
    const response = await fetch(viewPath)
    console.log('Response status:', response.status)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const content = await response.text()
    console.log('Content loaded successfully, length:', content.length)
    return content
  } catch (error) {
    console.error('Error loading view:', error)
    return null
  }
}

/**
 * Switch between different content views
 * @param {string} viewName - Name of the view to switch to
 */
export function switchView(viewName) {
  console.log("switchView called with:", viewName)
  
  document.querySelectorAll(".content-view").forEach((view) => {
    view.classList.remove("active")
  })

  const viewMap = {
    taskBoard: "taskBoardView",
    allTasks: "allTasksView",
    trash: "trashView",
    about: "aboutView",
  }

  const targetView = document.getElementById(viewMap[viewName])
  console.log("Target view element:", targetView)
  
  if (targetView) {
    targetView.classList.add("active")
    console.log("View switched successfully to:", viewName)
  } else {
    console.error("Target view not found:", viewMap[viewName])
  }
}
