import { recoverPasword } from '../services/userService.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recover");
    const resultado = document.getElementById("resultado");
  
    form.addEventListener("click", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
  
      try {
        const response = await recoverPasword({email});
  
        const data = await response.json();
  
        if (response.status === 400) {
          alert(data.message);
          return;
        }
  
        // Siempre mostrar mensaje genérico, incluso si el correo no existe
        resultado.innerText = data.message || "You will receive a reset link if the email exists.";
  
      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  });
  
