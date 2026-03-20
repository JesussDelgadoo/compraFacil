document.addEventListener('DOMContentLoaded',async ()=>{
    const token = localStorage.getItem('token');
    if (!token) {window.location.href = '/login.html'; return;}

    const welcome = document.getElementById('welcome');
    const logoutBtn = document.getElementById('logoutBtn');

    const kpiProceso = document.getElementById('kpiProceso');
    const kpiAprobadas = document.getElementById('kpiAprobadas');
    const kpiRechazadas = document.getElementById('kpiRechazadas');

    const chartSubtitle = document.getElementById('chartSubtitle');
    const chartContainer = document.getElementById('chartContainer');

    // Google Charts
    google.charts.load('current', {packages: ['corechart'] });

    async function fetchJSON(url, opts = {}) {
        const res = await fetch(url, {
            ...opts,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                ...(opts.headers || {})
            }
        });

        if (res.status === 204) return { ok: true, data: null };

        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    }

    async function loadMe() {
        const r = await fetchJSON('/api/me');
        if (!r.ok) {
            welcome.textContent = 'Sesión activa.';
            return;
        }

        // Ajusta en base a tu DB
        const nombre = r?.nombre_completo ?? r?.email ?? 'Usuario';
        welcome.textContent = `Bienvenido/a: ${nombre}`
    }

    async function loadResumen() {
        chartSubtitle.textContent = 'Cargando resumen...';

        const r = await fetchJSON('/api/requisiciones/resumen');
        if (!r.ok) {
            chartSubtitle.textContent = r.data?.message || 'No se pudo cargar el resumne.';
            return;
        }

        const total = Number(r.data?.total ?? 0);
        const enProceso = Number(r.data?.enProceso ?? 0);
        const aprobadas = Number(r.data?.aprobadas ?? 0);
        const rechazadas = Number(r.data?.rechazadas ?? 0);

        kpiProceso.textContent = enProceso;
        kpiAprobadas.textContent = aprobadas;
        kpiRechazadas.textContent = rechazadas;

        if (total === 0) {
            chartSubtitle.textContent = 'No hay requisiciones registradas.';
            chartContainer.innerHTML = '';
            return;
        }

        const p1 = Math.round((enProceso / total ) * 100);
        const p2 = Math.round((aprobadas / total )* 100);
        const p3 = Math.max(0, 100 - p1 - p2);

        chartSubtitle.textContent = `Total: ${total} | En Proceso ${p1}% | Aprobadas ${p2}% | Rechazadas ${p3}%`;

        google.charts.setOnLoadCallback(() => {
            const table = google.visualization.arrayToDataTable([
                ['Estatus', 'Cantidad'],
                ['En Proceso', enProceso],
                ['Aprobadas', aprobadas],
                ['Rechazadas',rechazadas],
            ]);

            const options = {
                legend: {position: 'bottom' },
                pieHole: 0.35,
                chartArea: { width: '92%', height: '80%' }
            };

            const chart = new google.visualization.PieChart(chartContainer);
            chart.draw(table, options);
        });
    }

    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
        } catch (_) {}

        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    await loadMe();
    await loadResumen();
    // await loadAprobadasPorDepartamento();
    // await loadAprobadasPorMes2026();
})