document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const status = document.getElementById('status');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch('/api/me', {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

    if (!res.ok) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }

    const me = await res.json();
    // Ajusta según lo que devuelva tu /api/me
    const nombre = me?.empleado
      ? `${me.empleado.nombre} ${me.empleado.ap} ${me.empleado.am}`
      : (me?.usuario ?? 'Usuario');

    status.textContent = `Bienvenido/a: ${nombre}`;

    } catch (err) {
    status.textContent = 'No se pudo validar sesión.';
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
});