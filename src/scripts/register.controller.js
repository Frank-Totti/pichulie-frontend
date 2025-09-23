
import { registerUser } from '../services/userService.js';

document.getElementById("register").addEventListener("click", async function (e) {
    e.preventDefault();

    // Obtener valores de los inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("passwordCheck").value;
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    //const last_name = document.getElementById("last-name").value;

    try {
        // Llamada al endpoint de registro
        const response = await registerUser({email, password, passwordCheck, name, age});

        if (response.status === 409) {
            alert("Ya existe un usuario con ese correo");
            return;
        }

        if (response.status === 400) {
            const data = await response.json();
            alert(data.message);
            return;
        }

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
        }

        const data = await response.json();

        alert("Registro exitoso, ahora puedes iniciar sesión");

    } catch (error) {
        alert(error.message);
    }
});
