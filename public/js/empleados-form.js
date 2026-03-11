document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const msg = document.getElementById('msg');
    const form = document.getElementById('empleadoForm');

    const idUsuarioEl = document.getElementById('id_usuario');
    const numeroEmpleadoEl = document.getElementById('numero_empleado');
    const puestoEspecificoEl = document.getElementById('puesto_especifico');
    const fechaContratacionEl = document.getElementById('fecha_contratacion');

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

    // 1. Cargar combo de Usuarios
    try {
        const usuarios = await apiGet('/api/usuarios');
        idUsuarioEl.innerHTML = '<option value="">-- Selecciona un Usuario --</option>';
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id_usuario;
            opt.textContent = `${u.nombre_completo} (${u.email})`;
            idUsuarioEl.appendChild(opt);
        });
    } catch (err) {
        msg.textContent = 'Error cargando usuarios: ' + err.message;
    }

    // 2. Si es editar, cargar el empleado
    if (id) {
        title.textContent = 'Editar Empleado';
        subtitle.textContent = 'Modifica los datos del empleado';
        msg.textContent = 'Cargando empleado...';

        try {
            const emp = await apiGet(`/api/empleados/${id}`);
            idUsuarioEl.value = emp.id_usuario ?? '';
            numeroEmpleadoEl.value = emp.numero_empleado ?? '';
            puestoEspecificoEl.value = emp.puesto_especifico ?? '';
            fechaContratacionEl.value = emp.fecha_contratacion ?? '';
            msg.textContent = '';
        } catch (err) {
            msg.textContent = 'Error cargando empleado: ' + err.message;
            return;
        }
    }

    // 3. Guardar
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Guardando...';

        const payload = {
            id_usuario: Number(idUsuarioEl.value),
            numero_empleado: numeroEmpleadoEl.value.trim(),
            puesto_especifico: puestoEspecificoEl.value.trim(),
            fecha_contratacion: fechaContratacionEl.value || null
        };

        try {
            const url = id ? `/api/empleados/${id}` : '/api/empleados';
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
                // Capturar el error específico si el usuario ya es empleado
                if(data.errors && data.errors.id_usuario) {
                    msg.textContent = 'Este usuario ya está registrado como empleado.';
                } else {
                    msg.textContent = data?.message || 'No se pudo guardar.';
                }
                return;
            }

            msg.textContent = 'Guardado correctamente';
            setTimeout(() => window.location.href = '/empleados.html', 500);
        } catch (err) {
            msg.textContent = 'Error: ' + err.message;
        }
    });
});