document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const status = document.getElementById('status');
    const tbody = document.querySelector('#requisicionesTable tbody');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const search = document.getElementById('search');

    let requisiciones = [];

    const normalize = (str) => (str ?? '').toString().toLowerCase().trim();

    function render(list) {
        tbody.innerHTML = '';

        if (!list.length) {
            status.textContent = 'No hay requisiciones para mostrar.';
            return;
        }

        status.textContent = `Requisiciones: ${list.length}`;

        for (const req of list) {
            const nombreSolicitante = req.usuario?.nombre_completo ?? 'Desconocido';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${req.folio ?? ''}</strong></td>
                <td>${req.fecha ?? ''}</td>
                <td>${req.motivo ?? ''}</td>
                <td>${nombreSolicitante}</td>
                <td><span class="badge">${req.estado ?? 'Borrador'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small" data-action="edit" data-id="${req.id_solicitud}">Editar</button>
                        <button class="btn btn-small btn-danger" data-action="delete" data-id="${req.id_solicitud}">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }

    async function fetchRequisiciones() {
        status.textContent = 'Cargando requisiciones...';
        tbody.innerHTML = '';

        try {
            const res = await fetch('/api/requisiciones', {
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
                status.textContent = data?.message || 'No se pudieron cargar las requisiciones.';
                return;
            }

            requisiciones = Array.isArray(data) ? data : [];
            render(requisiciones);
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
        }
    }

    // Buscador
    search.addEventListener('input', () => {
        const q = normalize(search.value);
        if (!q) return render(requisiciones);

        const filtered = requisiciones.filter(r => {
            const folio = normalize(r.folio);
            const motivo = normalize(r.motivo);
            const solicitante = normalize(r.usuario?.nombre_completo);
            const estado = normalize(r.estado);
            return folio.includes(q) || motivo.includes(q) || solicitante.includes(q) || estado.includes(q);
        });

        render(filtered);
    });

    // Acciones: Editar y Eliminar
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
            window.location.href = `/requisiciones-form.html?id=${encodeURIComponent(id)}`;
            return;
        }

        if (action === 'delete') {
            const ok = confirm('¿Seguro que deseas eliminar esta requisición?');
            if (!ok) return;

            try {
                const res = await fetch(`/api/requisiciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (res.status === 204) {
                    await fetchRequisiciones();
                    return;
                }

                const data = await res.json().catch(() => ({}));
                alert(data?.message || 'No se pudo eliminar la requisición.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

    });

    refreshBtn.addEventListener('click', fetchRequisiciones);

    const btnPDF = document.getElementById('btnPDF');

    if (btnPDF) {
        btnPDF.addEventListener('click', async () => {
            const element = document.getElementById('pdfContent');
            if (!element) return;

            const buttons = document.querySelectorAll('.no-print');
            buttons.forEach(b => b.computedStyleMap.display = 'none');

            const opt = {
                margin: 10,
                filename: `Requisicion_${window.currentRequisicion?.folio}.pdf` ,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait'}
            };

            await html2pdf().set(opt).from(element).save();

            buttons.forEach(b => b.computedStyleMap.display = 'flex');
        })
    }

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

    fetchRequisiciones();
});
