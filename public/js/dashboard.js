document.addEventListener('DOMContentLoaded',async ()=>{
    const token = localStorage.getItem('token');
    if (!token) {window.location.href = '/login.html'; return;}

    const welcome = document.getElementById('welcome');
    const logoutBtn = document.getElementById('logoutBtn');

    const kpiProceso = document.getElementById('kpiProceso');
    const kpiAprobadas = document.getElementById('kpiAprobadas');
    const kpiRechazadas = document.getElementById('kpiRechazadas');

    const chartSubtitle = document.getElementById('chartSubtitle');
    const chartContainer = document.getElementById('reqPieChart');
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

    //Segunda Grafica
    async function loadAprobadasPorDepartamento() {
        const subtitle = document.getElementById('depSubtitle')
        const container = document.getElementById('depPieChart')
        if (!container) return;

        subtitle.textContent = 'Cargando...';

        const r = await fetchJSON('/api/requisiciones/aprobadas-por-departamento');
        if (!r.ok) {
            subtitle.textContent = r.data?.message || 'No se pudo cargar.';
            return;
        }

        const rows = Array.isArray(r.data) ? r.data : [];
        const total = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

        if (!total) {
            subtitle.textContent = 'No hay requisiciones aprobadas.';
            container.innerHTML = '';
            return;
        }

        subtitle.textContent = `Total aprobadas: ${total}`;

        google.charts.setOnLoadCallback(() => {
            const table = google.visualization.arrayToDataTable([
                ['Departamento', 'Aprobadas'],
                ...rows.map(x => [x.departamento, Number(x.total)])
            ]);

            const options = {
                legend: {position: 'none'},
                chartArea: {width: '88%', height: '75%' },
                hAxis: { title: 'Departamento' },
                vAxis: { title: 'Aprobdas', minValue: 0}
            };

            new google.visualization.ColumnChart(container).draw(table,options);
        });
    }

    // Tercera Gráfica
    async function loadAprobadasPorMes2026() {
        const subtitle = document.getElementById('mesSubtitle');
        const container = document.getElementById('mesChart');
        if (!container) return;

        subtitle.textContent = 'Cargando...';

        const r = await fetchJSON('/api/requisiciones/aprobadas-mes');
        if (!r.ok) {
            subtitle.textContent = r.data?.message || 'No se pudo cargar.';
            return;
        }

        const data = r.data?.data ?? [];
        const total = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

        subtitle.textContent = `Año 2026 | Total aprobadas: ${total}`;

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        google.charts.setOnLoadCallback(() => {
            const table = google.visualization.arrayToDataTable([
                ['Mes', 'Aprobadas'],
                ...data.map(x => [meses[(x.mes || 1) - 1], Number(x.total)])
            ]);

            const options = {
                legend: { position: 'none' },
                chartArea: { width: '90%', height: '75%' },
                hAxis: { title: 'Meses (2026)' },
                vAxis: { title: 'Cantidad Aprobada', minValue: 0 },
            };

            new google.visualization.ColumnChart(container).draw(table, options);
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
    await loadAprobadasPorDepartamento();
    await loadAprobadasPorMes2026();
})