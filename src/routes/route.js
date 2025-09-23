
import { loginUser,changePasswordUser, recoverPasword, registerUser } from '../services/userServices.js';
import { initializeEditProfile } from '../scripts/edit_profile.controller.js';
import TaskManager from '../scripts/dashboard.controller.js'


const app = document.getElementById('principal-app');

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Load an HTML fragment by view name and initialize its corresponding logic.
 * @async
 * @param {string} name - The view name to load (e.g., "home", "board").
 * @throws {Error} If the view cannot be fetched.
 */
async function loadView(name) {
  console.log("Cargando vista:", name);
  const res = await fetch(viewURL(name));
  console.log("URL fetch:", viewURL(name), "status:", res.status);
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  console.log("Contenido recibido:", html.slice(0, 100)); // primeras 100 chars
  app.innerHTML = html;
  console.log("Vista inyectada en #principal-app");

  loadCSS(`/src/styles/${name}_styles.css`);

  if (name === 'about_us') {
    await import('../scripts/about_us.controller.js')
      .then(module => module.initAboutPage())
      .catch(err => console.error('Error loading about page:', err));
  }

  if (name === 'login') initLogin();
  if (name === 'dashboard') initDashboard();
  if (name === 'about_us') initAboutUs();
  if (name === 'edit_profile') initializeEditProfile();
  if (name === 'new_password') initNewPassword();
  if (name === 'recovery') initRecover();
  if  (name === 'register') initRegister();
}

function loadCSS(href) {
  // Elimina si ya existe
  document.querySelectorAll(`link[data-view-style]`).forEach(el => el.remove());

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.viewStyle = true;
  document.head.appendChild(link);
}

/**
 * Initialize the hash-based router.
 * Attaches an event listener for URL changes and triggers the first render.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // first render
}

/**
 * Handle the current route based on the location hash.
 * Fallback to 'home' if the route is unknown.
 */
function handleRoute() {
  const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'login';
  const known = [
    'login',
    'dashboard',
    'about_us',
    'edit_profile',
    'new_password',
    'recovery',
    'register'
  ];
  const route = known.includes(path) ? path : 'login';

  loadView(route).catch(err => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "home" view.
 * Attaches a submit handler to the register form to navigate to the board.
 */

function initDashboard() {
  setTimeout(() => {
    new TaskManager();
  }, 0);
}

function initRegister(){

  document.getElementById("register").addEventListener("click", async function (e) {
    e.preventDefault();

    // Obtener valores de los inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("passwordCheck").value;
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;

    try {
        // Llamada al endpoint de registro
        const data = await registerUser({email, password, passwordCheck, name, age});

        alert("Registro exitoso, ahora puedes iniciar sesión");

    } catch (error) {
        alert(error.message);
    }
  });
  }

function initAboutUs(){
  document.getElementById("today-button").addEventListener("click",async function () {

    console.log("Today button clicked");
    localStorage.setItem("currentDate",new Date());
    location.hash = '#/dashboard';
    
})
}

function initRecover(){
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recover");
    const resultado = document.getElementById("resultado");
  
    form.addEventListener("click", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
  
      try {
        const data = await recoverPasword({email});
  
        //const data = await response.json();
  
        // Siempre mostrar mensaje genérico, incluso si el correo no existe
        resultado.innerText = data.message || "You will receive a reset link if the email exists.";
  
      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  })
}

function initNewPassword(){

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const form = document.getElementById("resetForm");
  const messageEl = document.getElementById("message");

  form.addEventListener("click", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      messageEl.textContent = "Passwords do not match";
      messageEl.style.color = "red";
      return;
    }

    try {
      const data = await changePasswordUser({token, newPassword});

        messageEl.textContent = "Password changed successfully. Redirecting...";
        messageEl.style.color = "green";
        setTimeout(() => {
          //window.location.href = "index.html"; // login
          location.hash = '#/login';
        }, 1500);

        messageEl.textContent = data.message || "Error resetting password";
        messageEl.style.color = "red";

    } catch (err) {
      messageEl.textContent = data.message || "Error resetting password";
      messageEl.style.color = "red";
    }
  });


}

function initLogin(){

  document.getElementById("login").addEventListener("click",async function (e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    try {
        
        let data = await loginUser({email,password});

        localStorage.setItem("token", data.token);
        localStorage.setItem("id",data.user.id);

        //document.getElementById("resultado").innerText = "Bienvenido " + data.user.name;

        location.hash = '#/dashboard'; // Ajustar a view principal

    } catch (error) {
        alert(error.message);
      }     
  })  
}

