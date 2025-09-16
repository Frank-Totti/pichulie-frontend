//import { showAlert } from './shared.js'

export class EditProfileController {
  constructor() {
    this.form = null
    this.avatarInput = null
    this.avatarPreview = null
    this.passwordToggle = null
    this.confirmPasswordToggle = null
    this.isPasswordVisible = false
    this.isConfirmPasswordVisible = false
  }

  init() {
    console.log("Initializing Edit Profile Controller...")
    this.bindElements()
    this.bindEvents()
    this.loadUserData()
  }

  bindElements() {
    this.form = document.getElementById('profileForm')
    this.avatarInput = document.getElementById('avatarInput')
    this.avatarPreview = document.getElementById('avatarPreview')
    this.passwordToggle = document.getElementById('passwordToggle')
    this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle')
  }

  bindEvents() {

    const todayBtn = document.getElementById("today-button");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        console.log("Today button clicked");
        localStorage.setItem("currentDate", new Date());
        window.location.href = '../dashboard/dashboard.html';
      });
    } else {
      console.error("today-button no encontrado en bindEvents");
    }

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e))
    }

    // Avatar change
    const changeAvatarBtn = document.getElementById('changeAvatarBtn')
    if (changeAvatarBtn) {
      changeAvatarBtn.addEventListener('click', () => this.triggerAvatarUpload())
    }

    if (this.avatarInput) {
      this.avatarInput.addEventListener('change', (e) => this.handleAvatarChange(e))
    }

    // Password visibility toggles
    if (this.passwordToggle) {
      this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility())
    }

    if (this.confirmPasswordToggle) {
      this.confirmPasswordToggle.addEventListener('click', () => this.toggleConfirmPasswordVisibility())
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel())
    }

    // Success modal close
    const closeSuccessModal = document.getElementById('closeSuccessModal')
    if (closeSuccessModal) {
      closeSuccessModal.addEventListener('click', () => this.closeSuccessModal())
    }

    // Form validation on input
    this.setupFormValidation()
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input[required]')
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input))
      input.addEventListener('input', () => this.clearFieldError(input))
    })
  }

  loadUserData() {
    // In a real app, this would load from localStorage or API
    // For now, we'll use the default values from the HTML
    console.log("Loading user data...")
    
    // You can load from localStorage if user data is stored there
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        this.populateForm(user)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }

  populateForm(userData) {
    const nameInput = document.getElementById('userName')
    const emailInput = document.getElementById('userEmail')
    const ageInput = document.getElementById('userAge')

    if (nameInput && userData.name) nameInput.value = userData.name
    if (emailInput && userData.email) emailInput.value = userData.email
    if (ageInput && userData.age) ageInput.value = userData.age
  }

  triggerAvatarUpload() {
    if (this.avatarInput) {
      this.avatarInput.click()
    }
  }

  handleAvatarChange(event) {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error', 'dashboard')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size must be less than 5MB', 'error', 'dashboard')
        return
      }

      // Preview the image
      const reader = new FileReader()
      reader.onload = (e) => {
        if (this.avatarPreview) {
          this.avatarPreview.src = e.target.result
        }
      }
      reader.readAsDataURL(file)
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('userPassword')
    if (passwordInput) {
      this.isPasswordVisible = !this.isPasswordVisible
      passwordInput.type = this.isPasswordVisible ? 'text' : 'password'
      
      const eyeIcon = this.passwordToggle.querySelector('.eye-icon')
      if (eyeIcon) {
        eyeIcon.textContent = this.isPasswordVisible ? '🙈' : '👁️'
      }
    }
  }

  toggleConfirmPasswordVisibility() {
    const confirmPasswordInput = document.getElementById('confirmPassword')
    if (confirmPasswordInput) {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
      confirmPasswordInput.type = this.isConfirmPasswordVisible ? 'text' : 'password'
      
      const eyeIcon = this.confirmPasswordToggle.querySelector('.eye-icon')
      if (eyeIcon) {
        eyeIcon.textContent = this.isConfirmPasswordVisible ? '🙈' : '👁️'
      }
    }
  }

  validateField(field) {
    const value = field.value.trim()
    const fieldName = field.name
    let isValid = true
    let errorMessage = ''

    // Clear previous error
    this.clearFieldError(field)

    switch (fieldName) {
      case 'name':
        if (!value) {
          errorMessage = 'Name is required'
          isValid = false
        } else if (value.length < 2) {
          errorMessage = 'Name must be at least 2 characters'
          isValid = false
        } else if (value.length > 100) {
          errorMessage = 'Name must be less than 100 characters'
          isValid = false
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) {
          errorMessage = 'Email is required'
          isValid = false
        } else if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address'
          isValid = false
        }
        break

      case 'age':
        const age = parseInt(value)
        if (!value) {
          errorMessage = 'Age is required'
          isValid = false
        } else if (isNaN(age) || age < 13 || age > 122) {
          errorMessage = 'Age must be between 13 and 122'
          isValid = false
        }
        break

      case 'password':
        if (value && value.length < 8) {
          errorMessage = 'Password must be at least 8 characters'
          isValid = false
        } else if (value) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
          if (!passwordRegex.test(value)) {
            errorMessage = 'Password must contain uppercase, lowercase, and number'
            isValid = false
          }
        }
        break

      case 'confirmPassword':
        const password = document.getElementById('userPassword').value
        if (value && value !== password) {
          errorMessage = 'Passwords do not match'
          isValid = false
        }
        break
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage)
    }

    return isValid
  }

  showFieldError(field, message) {
    field.classList.add('error')
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error')
    if (existingError) {
      existingError.remove()
    }

    // Add new error message
    const errorDiv = document.createElement('div')
    errorDiv.className = 'field-error'
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
  }

  clearFieldError(field) {
    field.classList.remove('error')
    const errorDiv = field.parentNode.querySelector('.field-error')
    if (errorDiv) {
      errorDiv.remove()
    }
  }

  validateForm() {
    const requiredFields = ['name', 'email', 'age']
    let isValid = true

    // Validate required fields
    requiredFields.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`)
      if (field && !this.validateField(field)) {
        isValid = false
      }
    })

    // Validate password if provided
    const passwordField = document.getElementById('userPassword')
    const confirmPasswordField = document.getElementById('confirmPassword')
    
    if (passwordField && passwordField.value) {
      if (!this.validateField(passwordField)) {
        isValid = false
      }
      
      if (confirmPasswordField && !this.validateField(confirmPasswordField)) {
        isValid = false
      }
    }

    return isValid
  }

  async handleFormSubmit(event) {
    event.preventDefault()
    
    if (!this.validateForm()) {
      showAlert('Please fix the errors before submitting', 'error', 'dashboard')
      return
    }

    const saveBtn = document.getElementById('saveBtn')
    const btnText = saveBtn.querySelector('.btn-text')
    const btnLoading = saveBtn.querySelector('.btn-loading')

    // Show loading state
    saveBtn.disabled = true
    btnText.style.display = 'none'
    btnLoading.style.display = 'inline'

    try {
      // Simulate API call
      await this.saveProfile()
      
      // Show success modal
      this.showSuccessModal()
      
    } catch (error) {
      console.error('Error saving profile:', error)
      showAlert('Failed to save profile. Please try again.', 'error', 'dashboard')
    } finally {
      // Reset button state
      saveBtn.disabled = false
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
    }
  }

  async saveProfile() {
    const formData = new FormData(this.form)
    const profileData = {
      name: formData.get('name'),
      email: formData.get('email'),
      age: parseInt(formData.get('age')),
      password: formData.get('password') || undefined // Only include if provided
    }

    // Remove undefined password
    if (!profileData.password) {
      delete profileData.password
    }

    console.log('Saving profile data:', profileData)

    // In a real app, you would make an API call here
    // For now, we'll simulate a delay and save to localStorage
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save to localStorage (in a real app, this would be handled by the API response)
    localStorage.setItem('userData', JSON.stringify(profileData))

    return profileData
  }

  showSuccessModal() {
    const modal = document.getElementById('successModal')
    if (modal) {
      modal.style.display = 'flex'
    }
  }

  closeSuccessModal() {
    const modal = document.getElementById('successModal')
    if (modal) {
      modal.style.display = 'none'
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html'
  }

  handleCancel() {
    // Check if form has unsaved changes
    const hasChanges = this.hasUnsavedChanges()
    
    if (hasChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?')
      if (!confirmed) {
        return
      }
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html'
  }

  hasUnsavedChanges() {
    // Simple check - in a real app, you'd compare with original values
    const passwordField = document.getElementById('userPassword')
    return passwordField && passwordField.value.trim() !== ''
  }
/*
  async todayButton(){
    console.log("Today button clicked");
    localStorage.setItem("currentDate",new Date());
    window.location.href = '../dashboard/dashboard.html';
  }
*/
}


// Initialize when DOM is ready
function initializeEditProfile() {
  console.log("Initializing edit profile page...")
  const editProfileController = new EditProfileController()
  window.editProfileController = editProfileController
  editProfileController.init()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEditProfile)
} else {
  initializeEditProfile()
}
