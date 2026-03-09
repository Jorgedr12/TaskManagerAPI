const API_URL = 'http://localhost:3000';

async function loadTasks() {
    const res = await fetch(API_URL + '/tasks');
    const tasks = await res.json();

    const lista = document.getElementById('lista-tareas');
    lista.innerHTML = '';

    tasks.forEach(t => {
        const item = document.createElement('div');
        item.style.padding = "8px";
        item.style.borderBottom = "1px solid #ddd";
        
        item.innerHTML = `
            <strong>#${t.id}</strong>: ${t.title} 
            [${t.completed ? 'COMPLETADA' : 'PENDIENTE'}]
        `;
        
        lista.appendChild(item);
    });
}

loadTasks();