
class TaskManager {
  constructor() {
    this.tasks = {
      "to do": [{ id: 1, title: "Do math homework", time: "7:30 AM", reminder: true }],
      "in process": [{ id: 2, title: "Do english homework", time: "10:30 AM", reminder: false }],
      "finished": [{ id: 3, title: "Do biology homework", time: "5:00 AM", reminder: false }],
    }

    this.currentDate = new Date()//.toISOString().split("T")[0];
    //this.day = new Date().toISOString().split("T")[0];
    this.init()
  }

  init() {
    this.bindEvents()
    this.updateDateDisplay()
    this.renderTasks(this.currentDate.toISOString().split("T")[0])
    this.todayButton()
    
  }

  async todayButton(){

    document.getElementById("today").addEventListener("click", async function (e) {
      e.preventDefault();



        this.renderTasks(this.currentDate.toISOString().split("T")[0]);

    }) 

  }

  bindEvents() {
    // Add task buttons
    document.querySelector(".add-task-btn").addEventListener("click", () => this.openModal())
    document.querySelector(".add-task-main").addEventListener("click", () => this.openModal())

    // Modal events
    document.querySelector(".modal-close").addEventListener("click", () => this.closeModal())
    document.querySelector(".btn-cancel").addEventListener("click", () => this.closeModal())
    document.querySelector(".btn-save").addEventListener("click", () => this.saveTask())

    // Delete modal events
    document.getElementById("cancelDelete").addEventListener("click", () => this.closeDeleteModal())
    document.getElementById("confirmDelete").addEventListener("click", () => this.confirmDeleteTask())

    // Date navigation
    document.querySelector(".prev").addEventListener("click", () => this.changeDate(-1))
    document.querySelector(".next").addEventListener("click", () => this.changeDate(1))

    // Navigation menu
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => this.handleNavigation(e))
    })

    // Header dropdown toggle (hamburger) and profile actions
    const menuBtn = document.querySelector(".menu-icon")
    const headerDropdown = document.getElementById("headerDropdown")
    if (menuBtn) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        headerDropdown.classList.toggle("active")
        headerDropdown.setAttribute("aria-hidden", headerDropdown.classList.contains("active") ? "false" : "true")
      })
    }

    // Close dropdown when clicking elsewhere
    document.addEventListener("click", (e) => {
      if (headerDropdown && headerDropdown.classList.contains("active")) {
        // If click is outside the dropdown and outside the menu button
        const path = e.composedPath ? e.composedPath() : (e.path || [])
        if (!path.includes(headerDropdown) && !path.includes(menuBtn)) {
          headerDropdown.classList.remove("active")
          headerDropdown.setAttribute("aria-hidden", "true")
        }
      }
    })

    // Dropdown item actions
    const editProfileBtn = document.getElementById("editProfile")
    const logoutBtn = document.getElementById("logoutBtn")
    if (editProfileBtn) editProfileBtn.addEventListener("click", () => alert("Editar perfil (accion placeholder)"))
    if (logoutBtn) logoutBtn.addEventListener("click", () => alert("Cerrar Sesión (accion placeholder)"))

    // Close modal on overlay click
    document.querySelector(".modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal()
      }
    })

    // Task menu actions
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("task-menu")) {
        e.stopPropagation()
        this.showContextMenu(e)
      } else {
        this.hideContextMenu()
      }
    })

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("context-menu-item")) {
        this.handleContextMenuAction(e)
      }
    })
  }

  openModal(isEdit = false) {
    const modal = document.getElementById("taskModal")
    const modalTitle = document.getElementById("modalTitle")
    const actionBtn = document.getElementById("taskActionBtn")
    const cancelBtn = document.querySelector(".btn-cancel")

    // Set modal to create or edit mode
    if (isEdit) {
      modalTitle.textContent = "Edit Task"
      actionBtn.textContent = "EDIT"
      actionBtn.classList.add("edit-mode")
      cancelBtn.textContent = "DROP"
      cancelBtn.classList.add("drop-mode")
    } else {
      modalTitle.textContent = "Create Task"
      actionBtn.textContent = "CREATE"
      actionBtn.classList.remove("edit-mode")
      cancelBtn.textContent = "CANCEL"
      cancelBtn.classList.remove("drop-mode")
    }

    modal.classList.add("active")
    document.getElementById("taskTitle").focus()
  }

  closeModal() {
    document.getElementById("taskModal").classList.remove("active")
    this.clearModalForm()
    this.editingTask = null
  }

  clearModalForm() {
    document.getElementById("taskTitle").value = ""
    document.getElementById("taskDescription").value = ""
    document.getElementById("taskTime").value = "12:00"
    //document.getElementById("taskDate").value = new Date().toISOString().split("T")[0]
    document.getElementById("statusTodo").checked = true
    document.getElementById("taskReminder").checked = false
  }

  async saveTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const time = document.getElementById("taskTime").value;
    const description = document.getElementById("taskDescription").value.trim();
    const reminder = document.getElementById("taskReminder").checked;
  
    // Validar status seleccionado
    const statusRadios = document.querySelectorAll('input[name="status"]');
    let column = "to do"; // default
    for (const radio of statusRadios) {
      if (radio.checked) {
        column = radio.value; // Debe ser exactamente "to do", "in process" o "finished"
        break;
      }
    }
  
    if (!title) {
      alert("Please enter a task title");
      return;
    }
  
    // Obtener token
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }
  
    // Generar fecha y hora en ISO
    let taskDateTime;
    if (time) {
      const dateStr = this.currentDate.toISOString().split("T")[0];
      taskDateTime = new Date(`${dateStr}T${time}:00`).toISOString();
    } else {
      taskDateTime = this.currentDate.toISOString();
    }
  
    // Preparar body asegurando formato correcto
    const bodyData = {
      title,
      detail: description,
      status: column,
      task_date: taskDateTime
    };
  
    console.log("Sending task to backend:", bodyData);
    console.log("Token:", token);
  
    try {
      const response = await fetch("http://localhost:3000/api/task/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
  
      console.log("Response status:", response.status);
  
      // Obtener siempre el texto crudo primero
      const rawText = await response.text();
      console.log("Raw response body:", rawText);
  
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${rawText}`);
      }
  
      // Intentar parsear JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Backend did not return valid JSON: " + rawText);
      }
  
      console.log("Task created successfully:", data);
  
      // Reset form
      //document.getElementById("taskModal").reset();
  
      alert("Task created successfully!");
  
      // Actualizar lista de tareas localmente
      if (this.editingTask) {
        const task = this.tasks[this.editingTask.column].find(t => t.id === this.editingTask.id);
        if (task) {
          task.title = title;
          task.time = time ? this.formatTime(time) : "";
          task.description = description;
          task.reminder = reminder;
  
          if (this.editingTask.column !== column) {
            this.moveTask(this.editingTask.id, this.editingTask.column, column);
          }
        }
        this.editingTask = null;
      } else {
        const newTask = {
          id: Date.now(),
          title,
          time: time ? this.formatTime(time) : "",
          description,
          reminder,
        };
        this.tasks[column].push(newTask);
      }
  
      this.renderTasks(this.currentDate.toISOString().split("T")[0]);
      this.closeModal();
  
    } catch (error) {
      console.error("Error creating the task:", error);
      alert("An error occurred while creating the task. Check the console for details.");
    }
  }
  
  
  
  


  formatTime(time24) {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour12 = hours % 12 || 12
    const ampm = hours >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes} ${ampm}`
  }

  /*{
  "user_id": "68c0b77311637b188b40eb6b",
  "task_date" : "2025-09-14"
  
}*/
  async renderTasks(fecha) {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found. Please login.");

        const response = await fetch("http://localhost:3000/api/task/by-date", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body:JSON.stringify({
              user_id :localStorage.getItem("id"),
              task_date : fecha
            })

        });

        if (!response.ok) {
            throw new Error(`Error fetching tasks: ${response.status}`);
        }

        const data = await response.json();
        const tasksArray = data.tasks;

        // Agrupar y renderizar tareas como antes
        const tasksByColumn = { todo: [], inprocess: [], finished: [] };
        tasksArray.forEach(task => {
            if (task.status === "to do") tasksByColumn.todo.push(task);
            else if (task.status === "in process") tasksByColumn.inprocess.push(task);
            else if (task.status === "finished") tasksByColumn.finished.push(task);
        });

        Object.keys(tasksByColumn).forEach(column => {
            const taskList = document.querySelector(`[data-column="${column}"]`);
            if (!taskList) return;
            taskList.innerHTML = "";
            tasksByColumn[column].forEach(task => {
                const taskCard = this.createTaskCard(task, column);
                taskList.appendChild(taskCard);
            });
        });

    } catch (error) {
        console.error("Error rendering tasks:", error);
        alert(error.message);
    }
}

  createTaskCard(task, column) {
    const card = document.createElement("div")
    card.className = "task-card"
    card.dataset.taskId = task.id
    card.dataset.column = column

    card.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <button class="task-menu">☰</button>
            </div>
            <div class="task-meta">
                ${task.reminder ? '<span class="task-reminder">Remember</span>' : ""}
                ${task.time ? `<span class="task-time">${task.time}</span>` : ""}
                ${column === "todo" && task.reminder ? '<span class="task-check">✓</span>' : ""}
            </div>
        `

    return card
  }

  showContextMenu(e) {
    this.hideContextMenu() // Hide any existing menu

    const taskCard = e.target.closest(".task-card")
    const taskId = taskCard.dataset.taskId
    const column = taskCard.dataset.column

    // Create context menu
    const contextMenu = document.createElement("div")
    contextMenu.className = "context-menu active"
    contextMenu.innerHTML = `
      <button class="context-menu-item" data-action="edit" data-task-id="${taskId}" data-column="${column}">
        Edit Task
      </button>
      <button class="context-menu-item delete" data-action="delete" data-task-id="${taskId}" data-column="${column}">
        Delete Task
      </button>
    `

    // Position the menu
    const rect = e.target.getBoundingClientRect()
    contextMenu.style.position = "fixed"
    contextMenu.style.left = `${rect.right + 5}px`
    contextMenu.style.top = `${rect.top}px`

    document.body.appendChild(contextMenu)

    // Store reference for cleanup
    this.activeContextMenu = contextMenu
  }

  hideContextMenu() {
    if (this.activeContextMenu) {
      this.activeContextMenu.remove()
      this.activeContextMenu = null
    }
  }

  handleContextMenuAction(e) {
    const action = e.target.dataset.action
    const taskId = Number.parseInt(e.target.dataset.taskId)
    const column = e.target.dataset.column

    this.hideContextMenu()

    if (action === "edit") {
      this.editTask(taskId, column)
    } else if (action === "delete") {
      this.deleteTaskWithConfirmation(taskId, column)
    }
  }

  editTask(taskId, column) {
    const task = this.tasks[column].find((t) => t.id === taskId)
    if (!task) return

    // Pre-fill modal with task data
    document.getElementById("taskTitle").value = task.title
    document.getElementById("taskTime").value = task.time ? this.convertTo24Hour(task.time) : "12:00"
    document.getElementById("taskDate").value = new Date().toISOString().split("T")[0]
    document.getElementById("taskDescription").value = task.description || ""

    // Set status radio button
    if (column === "to do") {
      document.getElementById("statusTodo").checked = true
    } else if (column === "in process") {
      document.getElementById("statusInProcess").checked = true
    } else if (column === "finished") {
      document.getElementById("statusFinished").checked = true
    }

    // Set reminder checkbox
    document.getElementById("taskReminder").checked = task.reminder || false

    // Store editing task info
    this.editingTask = { id: taskId, column: column }

    // Open modal in edit mode
    this.openModal(true)
  }

  convertTo24Hour(time12) {
    if (!time12) return "12:00"
    const [time, modifier] = time12.split(" ")
    let [hours, minutes] = time.split(":")
    if (hours === "12") {
      hours = "00"
    }
    if (modifier === "PM") {
      hours = Number.parseInt(hours, 10) + 12
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`
  }

  deleteTaskWithConfirmation(taskId, column) {
    const task = this.tasks[column].find((t) => t.id === taskId)
    if (!task) return

    this.showDeleteModal(task, taskId, column)
  }

  showDeleteModal(task, taskId, column) {
    const deleteModal = document.getElementById("deleteModal")
    const taskTitle = document.getElementById("deleteTaskTitle")
    const taskDescription = document.getElementById("deleteTaskDescription")

    taskTitle.textContent = task.title
    taskDescription.textContent =
      task.description ||
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nisl tincidunt eget nullam non."

    
    this.taskToDelete = { id: taskId, column: column }

    deleteModal.classList.add("active")
  }

  closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active")
    this.taskToDelete = null
  }

  confirmDeleteTask() {
    if (this.taskToDelete) {
      this.deleteTask(this.taskToDelete.id, this.taskToDelete.column)
      this.closeDeleteModal()
    }
  }

  moveTask(taskId, fromColumn, toColumn) {
    if (fromColumn === toColumn) return

    const taskIndex = this.tasks[fromColumn].findIndex((task) => task.id === taskId)
    if (taskIndex === -1) return

    const task = this.tasks[fromColumn].splice(taskIndex, 1)[0]
    this.tasks[toColumn].push(task)
    this.renderTasks(this.currentDate.toISOString().split("T")[0])
  }

  deleteTask(taskId, column) {
    const taskIndex = this.tasks[column].findIndex((task) => task.id === taskId)
    if (taskIndex !== -1) {
      this.tasks[column].splice(taskIndex, 1)
      this.renderTasks(this.currentDate.toISOString().split("T")[0])
    }
  }

  changeDate(direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction)
    this.updateDateDisplay()
    this.updateHeaderDate()
    this.renderTasks(this.currentDate.toISOString().split("T")[0])
  }

  updateDateDisplay() {
    const months = [
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
    ]

    document.querySelector(".month").textContent = months[this.currentDate.getMonth()]
    document.querySelector(".year").textContent = this.currentDate.getFullYear()
    document.querySelector(".day").textContent = this.currentDate.getDate().toString().padStart(2, "0")
  }

  updateHeaderDate() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = days[this.currentDate.getDay()]
    const isToday = this.isToday(this.currentDate)

    document.querySelector(".date-title").textContent = `${dayName}${isToday ? " - Today" : ""}`
  }

  isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  handleNavigation(e) {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Add active class to clicked item
    e.currentTarget.classList.add("active")

    // Handle different navigation actions
    const text = e.currentTarget.textContent.trim()

    switch (text) {
      case "Add task":
        this.openModal()
        break
      case "Search by date":
        this.handleSearchByDate()
        break
      case "Today":
        this.goToToday()
        break
      case "See all tasks":
        this.showAllTasks()
        break
      case "Trash":
        this.showTrash()
        break
    }
  }

  handleSearchByDate() {
    const dateInput = prompt("Enter date (YYYY-MM-DD):")
    if (dateInput) {
      const newDate = new Date(dateInput)
      if (!isNaN(newDate)) {
        this.currentDate = newDate
        this.updateDateDisplay()
        this.updateHeaderDate()
      }
    }
  }

  goToToday() {
    this.currentDate = new Date()
    this.updateDateDisplay()
    this.updateHeaderDate()
  }

  showAllTasks() {
    console.log("Show all tasks functionality")
    // Lógica para mostrar las tareas (Me falta)
  }

  showTrash() {
    console.log("Show trash functionality")
    // Lógica para mostrar la basura (Me falta)
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new TaskManager()
})

// Añadir funcionalidad de arrastrar y soltar (probabliemente más adelante xd)
function enableDragAndDrop() {
  // control de eventos de arrastrar y soltar
  console.log("Drag and drop functionality can be added here")
}

export default TaskManager
