document.getElementById("today-button").addEventListener("click",async function () {

  console.log("Today button clicked");
  localStorage.setItem("currentDate",new Date());
  location.hash = '#/dashboard';
  
})

export function initSiteMap() {
  initializeHeaderButtons();
  updateUserDisplay();
}

function getTokenFromStorage() {
    // Check multiple storage locations
    return localStorage.getItem('token') || 
            localStorage.getItem('authToken') || 
            localStorage.getItem('jwt') ||
            sessionStorage.getItem('token');
}

// === User menu actions ===
function performLogout() {
    const tokenKeys = ['token', 'authToken', 'jwt'];
    tokenKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    window.top.location.href = '#/login';
}

async function updateUserDisplay() {
  const token = getTokenFromStorage();
  if (!token) return;

  try {
    // Fetch user details from the correct API endpoint
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/get-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch user details');

    const userData = await response.json();
    
    // Update UI with fetched user data
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    // Handle profile picture
    const profilePicture = userData.profile_picture;
    
    if (userName) userName.textContent = userData.name || 'User';
    if (profilePicture && profilePicture !== 'default-avatar.png' && profilePicture !== null) {
        const profileImg = document.getElementById('profilePicture');
        const initialsSpan = document.getElementById('userInitials');
                
        profileImg.src = profilePicture;
        profileImg.style.display = 'block';
        initialsSpan.style.display = 'none';
                
        profileImg.onerror = function() {
            console.error('Failed to load profile image:', profilePicture);
            this.style.display = 'none';
            initialsSpan.style.display = 'flex';
        };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

function initializeHeaderButtons() {
  // Menu button functionality
  const menuBtns = document.querySelectorAll(".menu__btn");

  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const dropdown = btn.nextElementSibling;
      const isOpen = dropdown.classList.toggle("active");
      btn.setAttribute("aria-expanded", isOpen);
      dropdown.setAttribute("aria-hidden", !isOpen);
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", e => {
    menuBtns.forEach(btn => {
      const dropdown = btn.nextElementSibling;
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
        dropdown.setAttribute("aria-hidden", "true");
      }
    });
  });

  // Edit profile button
  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    window.top.location.href = '#/edit_profile';
  });

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', performLogout);
}