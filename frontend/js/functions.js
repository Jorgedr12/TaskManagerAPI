const API_URL = 'https://taskmanagerapi-gsrs.onrender.com/tasks';

let tareasLocales = [];
let isSaving = false;

async function loadTasks() {
    if (isSaving) return;

    const loader = document.getElementById('loading');
    const listaPendientes = document.getElementById('lista-pendientes');
    const listaCompletados = document.getElementById('lista-completados');

    loader.style.display = 'block';
    listaPendientes.innerHTML = '';
    listaCompletados.innerHTML = '';

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const unico = {};
        tareasLocales = data.filter(t => {
            if (unico[t.id]) return false;
            unico[t.id] = true;
            return true;
        });

        loader.style.display = 'none';

        tareasLocales.forEach(t => {
            const item = document.createElement('div');
            item.style.margin = "10px 0";
            item.style.display = "flex";
            item.style.gap = "10px";

            const textoDisplay = t.completed ? `--- ${t.title} ---` : t.title;

            item.innerHTML = `
                <input type="checkbox" ${t.completed ? 'checked' : ''} 
                    onchange="toggleTask('${t.id}', this.checked)">
                <div id="container-${t.id}" style="flex-grow: 1;">
                    <span onclick="enableEdit('${t.id}')" style="cursor: pointer;">
                        ${textoDisplay}
                    </span>
                </div>
                <button onclick="deleteTask('${t.id}')">Eliminar</button>
            `;

            if (t.completed) {
                listaCompletados.appendChild(item);
            } else {
                listaPendientes.appendChild(item);
            }
        });
    } catch (e) {
        console.error("Error al cargar:", e);
    }
}

async function saveEdit(id) {
    if (isSaving) return;

    const input = document.getElementById(`edit-input-${id}`);
    if (!input) return;

    const nuevoTitulo = input.value.trim();
    const tarea = tareasLocales.find(t => String(t.id) === String(id));

    if (!nuevoTitulo || nuevoTitulo === tarea.title) {
        loadTasks();
        return;
    }

    isSaving = true;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: nuevoTitulo,
                completed: tarea.completed
            })
        });

        setTimeout(() => {
            isSaving = false;
            loadTasks();
        }, 300);

    } catch (e) {
        isSaving = false;
        console.error(e);
    }
}

function enableEdit(id) {
    const tarea = tareasLocales.find(t => String(t.id) === String(id));
    const container = document.getElementById(`container-${id}`);

    if (container.querySelector('input')) return;

    container.innerHTML = `<input type="text" id="edit-input-${id}" value="${tarea.title}">`;

    const input = document.getElementById(`edit-input-${id}`);
    input.focus();

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            input.onblur = null;
            saveEdit(id);
        }
    };
    input.onblur = () => saveEdit(id);
}

async function toggleTask(id, nuevoEstado) {
    if (isSaving) return;
    const tarea = tareasLocales.find(t => String(t.id) === String(id));

    isSaving = true;
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tarea.title, completed: nuevoEstado })
    });
    isSaving = false;
    loadTasks();
}

async function createTask() {
    const input = document.getElementById('taskInput');
    if (!input.value.trim() || isSaving) return;

    isSaving = true;
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.value, completed: false })
    });
    isSaving = false;
    input.value = '';
    loadTasks();
}

async function deleteTask(id) {
    if (!confirm("¿Eliminar?") || isSaving) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
}

document.addEventListener('DOMContentLoaded', loadTasks);