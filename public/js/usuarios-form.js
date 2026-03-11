document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // si existe => editar

    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const msg = document.getElementById('msg');
    const form = document.getElementById('userForm');

    // Elementos del formulario
    const nombreEl = document.getElementById('nombre_completo');
    const emailEl = document.getElementById('email');
    const rolSelect = document.getElementById('id_rol');
    const depSelect = document.getElementById('id_departamento');
    const contrasenaEl = document.getElementById('password');

    async function apiGet(url) {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Error GET ${url}`);
        return data;
    }

    function setOptions(selectEl, items, valueKey, labelFn) {
        selectEl.innerHTML = '<option value="">-- Selecciona --</option>';
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueKey];
            opt.textContent = labelFn(item);
            selectEl.appendChild(opt);
        });
    }

    // 1. Cargar combos de Roles y Departamentos
    try {
        const roles = await apiGet('/api/roles');
        setOptions(rolSelect, roles, 'id_rol', r => r.nombre_rol);

        const deps = await apiGet('/api/departamentos');
        setOptions(depSelect, deps, 'id_departamento', d => d.nombre_departamento);
    } catch (err) {
        msg.textContent = 'Error cargando catálogos: ' + err.message;
    }

    // 2. Si es editar, cargar usuario
    if (id) {
        title.textContent = 'Editar usuario';
        subtitle.textContent = 'Modifica los datos y guarda cambios';
        msg.textContent = 'Cargando usuario...';

        try {
            const u = await apiGet(`/api/usuarios/${id}`);
            nombreEl.value = u.nombre_completo ?? '';
            emailEl.value = u.email ?? '';
            rolSelect.value = u.id_rol ?? '';
            depSelect.value = u.id_departamento ?? '';
            msg.textContent = '';
        } catch (err) {
            msg.textContent = 'Error cargando usuario: ' + err.message;
            return;
        }
    }

    // 3. Guardar
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Guardando...';

        const payload = {
            nombre_completo: nombreEl.value.trim(),
            email: emailEl.value.trim(),
            id_rol: Number(rolSelect.value),
            id_departamento: Number(depSelect.value)
        };

        const pass = contrasenaEl.value.trim();
        if (pass.length > 0) payload.password = pass;

        try {
            const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                msg.textContent = data?.message || 'No se pudo guardar.';
                return;
            }

            msg.textContent = 'Guardado correctamente';
            setTimeout(() => window.location.href = '/usuarios.html', 600);
        } catch (err) {
            msg.textContent = 'Error: ' + err.message;
        }
    });
});