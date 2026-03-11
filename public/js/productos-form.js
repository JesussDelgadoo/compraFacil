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
    const form = document.getElementById('productoForm');

    // Mapeo de Elementos del HTML
    const skuEl = document.getElementById('sku');
    const nombreEl = document.getElementById('nombre');
    const descripcionEl = document.getElementById('descripcion');
    const unidadMedidaEl = document.getElementById('unidad_medida');
    const precioReferenciaEl = document.getElementById('precio_referencia');

    async function apiGet(url) {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Error al obtener datos`);
        return data;
    }

    // 1. Si es editar, cargar producto de la Base de Datos
    if (id) {
        title.textContent = 'Editar producto';
        subtitle.textContent = 'Modifica los datos y guarda cambios';
        msg.textContent = 'Cargando producto...';

        try {
            const p = await apiGet(`/api/productos/${id}`);
            skuEl.value = p.sku ?? '';
            nombreEl.value = p.nombre ?? '';
            descripcionEl.value = p.descripcion ?? '';
            unidadMedidaEl.value = p.unidad_medida ?? '';
            precioReferenciaEl.value = p.precio_referencia ?? '';
            msg.textContent = '';
        } catch (err) {
            msg.textContent = 'Error cargando producto: ' + err.message;
            return;
        }
    }

    // 2. Evento al Guardar el Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Guardando...';

        // Creamos el paquete de datos con los valores exactos de la BD
        const payload = {
            sku: skuEl.value.trim(),
            nombre: nombreEl.value.trim(),
            descripcion: descripcionEl.value.trim(),
            unidad_medida: unidadMedidaEl.value.trim(),
            precio_referencia: precioReferenciaEl.value ? parseFloat(precioReferenciaEl.value) : null
        };

        try {
            // Si hay ID usamos PUT (Actualizar), si no, usamos POST (Crear)
            const url = id ? `/api/productos/${id}` : '/api/productos';
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
                msg.textContent = data?.message || 'No se pudo guardar el producto.';
                return;
            }

            msg.textContent = '¡Producto guardado correctamente!';
            // Esperamos medio segundo y lo regresamos a la tabla
            setTimeout(() => window.location.href = '/productos.html', 500);
        } catch (err) {
            msg.textContent = 'Error: ' + err.message;
        }
    });
});