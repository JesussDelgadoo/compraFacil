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
    const form = document.getElementById('requisicionForm');

    const folioEl = document.getElementById('folio');
    const idUsuarioEl = document.getElementById('id_usuario');
    const idProductoEl = document.getElementById('id_producto');
    const cantidadEl = document.getElementById('cantidad');
    const fechaEl = document.getElementById('fecha');
    const fechaEstimadaEl = document.getElementById('fecha_estimada');
    const estadoEl = document.getElementById('estado');
    const motivoEl = document.getElementById('motivo');

    async function apiGet(url) {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Error GET ${url}`);
        return data;
    }

    try {
        const usuarios = await apiGet('/api/usuarios');
        idUsuarioEl.innerHTML = '<option value="">-- Selecciona un Solicitante --</option>';
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id_usuario;
            opt.textContent = `${u.nombre_completo}`;
            idUsuarioEl.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando usuarios', err);
    }

    try {
        const productos = await apiGet('/api/productos');
        idProductoEl.innerHTML = '<option value="">-- Selecciona un Producto --</option>';
        productos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id_producto;
            opt.textContent = `${p.sku} - ${p.nombre}`;
            idProductoEl.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando productos', err);
    }

    if (id) {
        title.textContent = 'Editar Requisición';
        subtitle.textContent = 'El folio, solicitante y fecha de creación están bloqueados.';
        msg.textContent = 'Cargando solicitud...';

        try {
            const req = await apiGet(`/api/requisiciones/${id}`);
            folioEl.value = req.folio ?? '';
            idUsuarioEl.value = req.id_usuario ?? '';
            idProductoEl.value = req.id_producto ?? '';
            cantidadEl.value = req.cantidad ?? 1;
            estadoEl.value = req.estado ?? 'Borrador';
            motivoEl.value = req.motivo ?? '';
            
            if (req.fecha) fechaEl.value = req.fecha.replace(' ', 'T').substring(0, 16);
            if (req.fecha_estimada) fechaEstimadaEl.value = req.fecha_estimada.substring(0, 10);
            
            idUsuarioEl.disabled = true;
            
            msg.textContent = '';
        } catch (err) {
            msg.textContent = 'Error cargando requisición: ' + err.message;
            return;
        }
    } else {
        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
        fechaEl.value = ahora.toISOString().slice(0, 16); 
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Guardando...';

        const payload = {
            id_usuario: Number(idUsuarioEl.value),
            id_producto: Number(idProductoEl.value),
            cantidad: Number(cantidadEl.value),
            estado: estadoEl.value,
            motivo: motivoEl.value.trim(),
            fecha_estimada: fechaEstimadaEl.value || null
        };

        if (id) {
            payload.folio = folioEl.value.trim();
        }

        if (fechaEl.value) {
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

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
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