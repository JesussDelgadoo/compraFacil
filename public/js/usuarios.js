document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const status = document.getElementById('status');
    const tbody = document.querySelector('#userTable tbody');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const search = document.getElementById('search');

    let users = [];

    const normalize = (str) => (str ?? '').toString().toLowerCase().trim();
    const firstOrSelf = (x) => Array.isArray(x) ? (x[0] ?? null) : x;

    function render(list) {
        tbody.innerHTML = '';

        if (!list.length) {
            status.textContent = 'No hay usuarios para mostrar.';
            return;
        }

        status.textContent = `Usuarios: ${list.length}`;
        
        for (const u of list) {

            const rol = u.rol?.nombre_rol ?? ''; 
            const emp = u.nombre_completo ?? '';
            const dep = u.departamento?.nombre_departamento ?? '';
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${u.id ?? ''}</td>
                <td>${u.usuario ?? ''}</td>
                <td>${rol}</td>
                <td>${emp}</td>
                <td>${dep}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small" data-action="edit" data-id="${u.id}">Editar</button>
                        <button class="btn btn-small" data-action="encrypt" data-id="${u.id}">Encriptar</button>
                        <button class="btn btn-small btn-danger" data-action="delete" data-id="${u.id}">Eliminar</button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        }
    }

    async function fetchUsers() {
        status.textContent = 'Cargando usuarios...';
        tbody.innerHTML = '';

        try {
            const res = await fetch('/api/usuarios',{
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer' + token
                }
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                status.textContent = data?.message || 'No se pudieron cargar usuarios.';
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                }
                return;
            }

            users = Array.isArray(data) ? data : [];
            render(users);
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
        }
    }

    // Buscar
    search.addEventListener('input',() => {
        const q = normalize(search.value);
        if (!q) return render(users);

        const filtered = users.filter(u => {

            const rol = normalize(u.rol?.nombre_rol);
            const usuario = normalize(u.email);
            const emp = normalize(u.nombre_completo);
            const dep = normalize(u.departamento?.nombre_departamento);

            return usuario.includes(q) || rol.includes(q) || emp.includes(q) || dep.includes(q);
        });

        render(filtered);
    });

    // Acciones
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
            window.location.href = `/usuario-form.html?id=${encodeURIComponent(id)}`;
            return;
        }

        if (action === 'delete') {
            const ok = confirm('Seguro que deseas eliminar este usuario?');
            if (!ok) return;

            try {
                const res = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (res.status === 204) {
                    await fetchUsers();
                    return;
                }

                const data = await res.json().catch(() =>({}));
                alert(data?.message || 'No se pudo eliminar.');

            } catch (err) {
                alert('Error: ' + err.message);
            }
            return;
        }

        if (action === 'encrypt') {
            // Pedimos la contraseña nueva para hashearla
            const nueva = prompt('Escribe la nueva contraseña para este usuario(minimo 6 caracteres):');
            if (nueva === null) return; // cancel
            if (nueva.trim().length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            try {
                const res = await fetch(`/api/usuarios/${id}/rehash`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({contrasena: nueva.trim()})
                });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    alert(data?.message || 'No se pudo encriptar/actualizar la contrasena.');
                    return;
                }

                alert('Contraseña actualizada (hasheada)');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
    });

    refreshBtn.addEventListener('click', fetchUsers);

    logoutBtn.addEventListener('click', async () => {
        try{
            await fetch('/api/logout', {
                method: 'POST',
                headers:{'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
            });
        } catch (_) {}
        
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    fetchUsers();
});