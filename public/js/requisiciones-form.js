document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // Si existe un ID en la URL, estamos en modo Editar

    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const msg = document.getElementById('msg');
    const form = document.getElementById('requisicionForm');

    // Elementos del DOM
    const folioEl = document.getElementById('folio');
    const idUsuarioEl = document.getElementById('id_usuario');
    const estadoEl = document.getElementById('estado');
    const fechaEl = document.getElementById('fecha');
    const motivoEl = document.getElementById('motivo');

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

    // 1. Cargar combo de Usuarios (quién solicita)
    try {
        const usuarios = await apiGet('/api/usuarios');
        idUsuarioEl.innerHTML = '<option value="">-- Selecciona un Solicitante --</option>';
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id_usuario;
            opt.textContent = `${u.nombre_completo} (${u.email})`;
            idUsuarioEl.appendChild(opt);
        });
    } catch (err) {
        msg.textContent = 'Error cargando usuarios: ' + err.message;
    }

    // 2. Si es editar, cargar datos de la requisición
    if (id) {
        title.textContent = 'Editar Requisición';
        subtitle.textContent = 'Modifica los datos de la solicitud';
        msg.textContent = 'Cargando solicitud...';

        try {
            const req = await apiGet(`/api/requisiciones/${id}`);
            folioEl.value = req.folio ?? '';
            idUsuarioEl.value = req.id_usuario ?? '';
            estadoEl.value = req.estado ?? 'Borrador';
            motivoEl.value = req.motivo ?? '';
            
            // Formatear la fecha para que el input type="datetime-local" la entienda (YYYY-MM-DDThh:mm)
            if (req.fecha) {
                // Si la DB devuelve '2025-12-01 09:30:00', lo convertimos a '2025-12-01T09:30'
                const fechaFormateada = req.fecha.replace(' ', 'T').substring(0, 16);
                fechaEl.value = fechaFormateada;
            }
            
            msg.textContent = '';
        } catch (err) {
            msg.textContent = 'Error cargando requisición: ' + err.message;
            return;
        }
    }

    // 3. Guardar (Crear o Actualizar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Guardando...';

        const payload = {
            folio: folioEl.value.trim(),
            id_usuario: Number(idUsuarioEl.value),
            estado: estadoEl.value,
            motivo: motivoEl.value.trim(),
        };

        // Si el usuario eligió una fecha, la mandamos; si no, dejamos que la BD la ponga (si es nuevo)
        if (fechaEl.value) {
            // Reemplazamos la T para enviarla en formato MySQL estándar: YYYY-MM-DD HH:MM:00
            payload.fecha = fechaEl.value.replace('T', ' ') + ':00';
        }

        try {
            const url = id ? `/api/requisiciones/${id}` : '/api/requisiciones';
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
                msg.textContent = data?.message || 'No se pudo guardar la requisición.';
                return;
            }

            msg.textContent = '¡Requisición guardada correctamente!';
            setTimeout(() => window.location.href = '/requisiciones.html', 500);
        } catch (err) {
            msg.textContent = 'Error: ' + err.message;
        }
    });
});