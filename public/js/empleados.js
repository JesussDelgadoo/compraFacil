document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const status = document.getElementById('status');
    const tbody = document.querySelector('#empleadosTable tbody');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const search = document.getElementById('search');

    let empleados = [];

    const normalize = (str) => (str ?? '').toString().toLowerCase().trim();

    function render(list) {
        tbody.innerHTML = '';

        if (!list.length) {
            status.textContent = 'No hay empleados para mostrar.';
            return;
        }

        status.textContent = `Empleados: ${list.length}`;
        
        for (const e of list) {
            // Sacamos el nombre desde la relación con la tabla usuarios
            const nombreUsuario = e.usuario?.nombre_completo ?? 'Usuario sin nombre';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${e.id_empleado ?? ''}</td>
                <td>${e.numero_empleado ?? 'N/A'}</td>
                <td>${nombreUsuario}</td>
                <td>${e.puesto_especifico ?? 'N/A'}</td>
                <td>${e.fecha_contratacion ?? 'N/A'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small" data-action="edit" data-id="${e.id_empleado}">Editar</button>
                        <button class="btn btn-small btn-danger" data-action="delete" data-id="${e.id_empleado}">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }

    async function fetchEmpleados() {
        status.textContent = 'Cargando empleados...';
        tbody.innerHTML = '';

        try {
            const res = await fetch('/api/empleados', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                }
                status.textContent = data?.message || 'No se pudieron cargar los empleados.';
                return;
            }

            empleados = Array.isArray(data) ? data : [];
            render(empleados);
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
        }
    }

    // Buscar
    search.addEventListener('input', () => {
        const q = normalize(search.value);
        if (!q) return render(empleados);

        const filtered = empleados.filter(e => {
            const num = normalize(e.numero_empleado);
            const nombre = normalize(e.usuario?.nombre_completo);
            const puesto = normalize(e.puesto_especifico);
            return num.includes(q) || nombre.includes(q) || puesto.includes(q);
        });

        render(filtered);
    });

    // Acciones (Editar y Eliminar)
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
            window.location.href = `/empleados-form.html?id=${encodeURIComponent(id)}`;
            return;
        }

        if (action === 'delete') {
            const ok = confirm('¿Seguro que deseas eliminar este empleado?');
            if (!ok) return;

            try {
                const res = await fetch(`/api/empleados/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (res.status === 204) {
                    await fetchEmpleados();
                    return;
                }

                const data = await res.json().catch(() => ({}));
                alert(data?.message || 'No se pudo eliminar el empleado.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
    });

    refreshBtn.addEventListener('click', fetchEmpleados);

    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
            });
        } catch (_) {}
        
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    fetchEmpleados();
});