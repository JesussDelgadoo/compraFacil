document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const status = document.getElementById('status');
    const tbody = document.querySelector('#productosTable tbody');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const search = document.getElementById('search');

    let productos = [];

    const normalize = (str) => (str ?? '').toString().toLowerCase().trim();

    function render(list) {
        tbody.innerHTML = '';

        if (!list.length) {
            status.textContent = 'No hay productos para mostrar.';
            return;
        }

        status.textContent = `Productos: ${list.length}`;
        
        for (const p of list) {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${p.id_producto ?? ''}</td>
                <td>${p.sku ?? ''}</td>
                <td>${p.nombre ?? ''}</td>
                <td>${p.unidad_medida ?? ''}</td>
                <td>$${p.precio_referencia ?? '0.00'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small" data-action="edit" data-id="${p.id_producto}">Editar</button>
                        <button class="btn btn-small btn-danger" data-action="delete" data-id="${p.id_producto}">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }

    async function fetchProductos() {
        status.textContent = 'Cargando productos...';
        tbody.innerHTML = '';

        try {
            const res = await fetch('/api/productos', {
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
                status.textContent = data?.message || 'No se pudieron cargar los productos.';
                return;
            }

            productos = Array.isArray(data) ? data : [];
            render(productos);
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
        }
    }

    // Buscar
    search.addEventListener('input', () => {
        const q = normalize(search.value);
        if (!q) return render(productos);

        const filtered = productos.filter(p => {
            const sku = normalize(p.sku);
            const nombre = normalize(p.nombre);
            return sku.includes(q) || nombre.includes(q);
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
            window.location.href = `/productos-form.html?id=${encodeURIComponent(id)}`;
            return;
        }

        if (action === 'delete') {
            const ok = confirm('¿Seguro que deseas eliminar este producto?');
            if (!ok) return;

            try {
                const res = await fetch(`/api/productos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (res.status === 204) {
                    await fetchProductos(); // Recarga la tabla si se borró con éxito
                    return;
                }

                const data = await res.json().catch(() => ({}));
                alert(data?.message || 'No se pudo eliminar el producto.');

            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
    });
    refreshBtn.addEventListener('click', fetchProductos);

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

    fetchProductos();
});