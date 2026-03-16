var API_URL = 'https://taskmanagerapi-gsrs.onrender.com/api/';
var tareasLocales = [];
var isSaving = false;

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function loadTasks() {
    if (isSaving) return;
    
    var loader = document.getElementById('loading');
    var listaP = document.getElementById('lista-pendientes');
    var listaC = document.getElementById('lista-completados');

    if (!loader || !listaP || !listaC) return;

    loader.classList.remove('hidden');
    listaP.innerHTML = ""; 
    listaC.innerHTML = "";

    try {
        var respuesta = await fetch(API_URL + "tasks", {
            headers: getAuthHeader()
        });

        if (respuesta.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        var datos = await respuesta.json();
        tareasLocales = datos;
        
        loader.classList.add('hidden');
        renderTasks();

    } catch (error) {
        console.log("Error al cargar: " + error);
        loader.classList.add('hidden');
    }
}

async function createTask() {
    var input = document.getElementById('taskInput');
    var titulo = input.value;

    if (titulo.trim() == "") return;

    isSaving = true;
    try {
        await fetch(API_URL + "tasks", {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ title: titulo, completed: false })
        });
        
        input.value = ""; 
        isSaving = false;
        loadTasks();
    } catch (e) {
        isSaving = false;
        console.log("Error al crear");
    }
}

async function deleteTask(id) {
    if (confirm("¿Eliminar esta tarea?")) {
        await fetch(API_URL + "tasks/" + id, { 
            method: 'DELETE',
            headers: getAuthHeader()
        });
        loadTasks();
    }
}

async function toggleTask(id, nuevoEstado) {
    const tarea = tareasLocales.find(t => t.id == id);
    isSaving = true;
    await fetch(API_URL + "tasks/" + id, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ title: tarea.title, completed: nuevoEstado })
    });
    isSaving = false;
    loadTasks();
}

async function saveEdit(id) {
    var input = document.getElementById("edit-input-" + id);
    var nuevoTexto = input.value.trim();

    if (nuevoTexto == "") {
        loadTasks();
        return;
    }

    await fetch(API_URL + "tasks/" + id, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ title: nuevoTexto })
    });
    loadTasks();
}

function renderTasks() {
    var listaP = document.getElementById('lista-pendientes');
    var listaC = document.getElementById('lista-completados');
    var todoCount = 0;
    var doneCount = 0;

    tareasLocales.forEach(t => {
        var item = document.createElement('article');
        item.className = "bg-[#1c1c1c] border border-white/5 p-5 rounded-md group hover:border-yellow-200/30 transition-all duration-300 shadow-md flex items-start gap-4 text-left";
        var estiloTexto = t.completed ? "text-gray-600 line-through" : "text-white";

        item.innerHTML = `
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask('${t.id}', this.checked)" class="mt-1.5 w-4 h-4 accent-yellow-200">
            <div id="container-${t.id}" class="flex-1 min-w-0 text-left">
                <h3 onclick="enableEdit('${t.id}')" class="${estiloTexto} font-medium cursor-pointer block w-full">${t.title}</h3>
            </div>
            <button onclick="deleteTask('${t.id}')" class="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-trash-can"></i></button>
        `;

        if (t.completed) {
            listaC.appendChild(item);
            doneCount++;
        } else {
            listaP.appendChild(item);
            todoCount++;
        }
    });

    document.getElementById('count-todo').innerText = todoCount;
    document.getElementById('count-done').innerText = doneCount;
}

function setupUserUI() {
    const userName = localStorage.getItem('userName');
    const nameElement = document.getElementById('user-name');

    if (nameElement && userName && userName !== "undefined") {
        nameElement.innerText = `Hola, ${userName}`;
        nameElement.classList.remove('hidden');
    } else if (nameElement) {
        nameElement.innerText = "";
    }

}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');

    btn.disabled = true;
    btn.innerText = "Verificando...";

    try {
        const res = await fetch(API_URL + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);

            const nombreAGuardar = data.name || data.email || "Usuario";
            localStorage.setItem('userName', nombreAGuardar);

            window.location.href = 'index.html';
        } else {
            alert(data.error || "Credenciales incorrectas");
            btn.disabled = false;
            btn.innerText = "Entrar";
        }
    } catch (err) {
        alert("Error al conectar con el servidor");
        btn.disabled = false;
        btn.innerText = "Entrar";
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-register');

    btn.disabled = true;
    btn.innerText = "Procesando...";

    try {
        const res = await fetch(API_URL + 'users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            window.location.href = 'login.html';
        } else {
            alert(data.error || "Error al registrar el usuario");
            btn.disabled = false;
            btn.innerText = "Registrarme";
        }
    } catch (err) {
        console.error("Error en el registro:", err);
        alert("No se pudo conectar con el servidor");
        btn.disabled = false;
        btn.innerText = "Registrarme";
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    setupUserUI();
    loadTasks();
});