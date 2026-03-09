var API_URL = 'https://taskmanagerapi-gsrs.onrender.com/tasks';

var tareasLocales = [];
var isSaving = false;

async function loadTasks() {
    if (isSaving == true) {
        return;
    }
    
    var loader = document.getElementById('loading');
    var listaP = document.getElementById('lista-pendientes');
    var listaC = document.getElementById('lista-completados');

    if (loader == null || listaP == null || listaC == null) {
        return;
    }

    loader.classList.remove('hidden');
    listaP.innerHTML = ""; 
    listaC.innerHTML = "";

    try {
        var respuesta = await fetch(API_URL);
        var datos = await respuesta.json();
        tareasLocales = datos;
        
        loader.classList.add('hidden');

        var todoCount = 0;
        var doneCount = 0;

        for (var i = 0; i < tareasLocales.length; i++) {
            var t = tareasLocales[i];
            
            var item = document.createElement('article');
            item.className = "bg-[#1c1c1c] border border-white/5 p-5 rounded-md group hover:border-yellow-200/30 transition-all duration-300 shadow-md flex items-start gap-4 text-left";
            
            var estiloTexto = "text-white";
            if (t.completed == true) {
                estiloTexto = "text-gray-600 line-through decoration-1";
            }

            item.innerHTML = `
                <input type="checkbox" ${t.completed ? 'checked' : ''} 
                    onchange="toggleTask('${t.id}', this.checked)"
                    class="mt-1.5 w-4 h-4 accent-yellow-200 cursor-pointer shrink-0 border-white/10 bg-[#333]">
                
                <div id="container-${t.id}" class="flex-1 min-w-0 text-left">
                    <h3 onclick="enableEdit('${t.id}')" 
                        class="${estiloTexto} font-medium cursor-pointer wrap-break-words leading-relaxed text-left block w-full">
                        ${t.title}
                    </h3>
                </div>

                <button onclick="deleteTask('${t.id}')" 
                    class="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
            `;

            if (t.completed == true) {
                listaC.appendChild(item);
                doneCount = doneCount + 1;
            } else {
                listaP.appendChild(item);
                todoCount = todoCount + 1;
            }
        }

        if (todoCount == 0) {
            listaP.innerHTML = "<div class='py-8 text-center border border-dashed border-white/10 rounded-md text-gray-500 text-sm'>No hay tareas pendientes</div>";
        }
        if (doneCount == 0) {
            listaC.innerHTML = "<div class='py-8 text-center border border-dashed border-white/10 rounded-md text-gray-700 text-sm'>No hay tareas completadas</div>";
        }

        document.getElementById('count-todo').innerText = todoCount;
        document.getElementById('count-done').innerText = doneCount;

    } catch (error) {
        console.log("Error al cargar: " + error);
        loader.classList.add('hidden');
    }
}

async function createTask() {
    var input = document.getElementById('taskInput');
    var titulo = input.value;

    if (titulo.trim() == "") {
        alert("Escribe una tarea");
        return;
    }

    isSaving = true;
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    var confirmar = confirm("¿Eliminar esta tarea?");
    if (confirmar == true) {
        await fetch(API_URL + "/" + id, { method: 'DELETE' });
        loadTasks();
    }
}

async function toggleTask(id, nuevoEstado) {
    var tareaEncontrada;
    for (var i = 0; i < tareasLocales.length; i++) {
        if (tareasLocales[i].id == id) {
            tareaEncontrada = tareasLocales[i];
        }
    }

    isSaving = true;
    await fetch(API_URL + "/" + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tareaEncontrada.title, completed: nuevoEstado })
    });
    isSaving = false;
    loadTasks();
}

function enableEdit(id) {
    var tarea;
    for (var i = 0; i < tareasLocales.length; i++) {
        if (tareasLocales[i].id == id) {
            tarea = tareasLocales[i];
        }
    }
    
    var caja = document.getElementById("container-" + id);
    if (caja.querySelector('input') != null) return;

    caja.innerHTML = `
        <input type="text" id="edit-input-${id}" 
            value="${tarea.title}" maxlength="50"
            class="bg-transparent border-b border-yellow-200/50 text-white w-full focus:outline-none py-1 text-left">
    `;
    
    var inputEdicion = document.getElementById("edit-input-" + id);
    inputEdicion.focus();
    
    inputEdicion.onkeydown = function(e) { 
        if (e.key == 'Enter') { 
            inputEdicion.onblur = null; 
            saveEdit(id); 
        } 
    };
    inputEdicion.onblur = function() { saveEdit(id); };
}

async function saveEdit(id) {
    var input = document.getElementById("edit-input-" + id);
    var nuevoTexto = input.value.trim();

    if (nuevoTexto == "") {
        loadTasks();
        return;
    }

    await fetch(API_URL + "/" + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nuevoTexto, completed: false })
    });
    loadTasks();
}

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});