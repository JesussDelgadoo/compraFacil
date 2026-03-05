document.addEventListener('DOMContentLoaded',()=>{
    const form = document.getElementById('loginForm');
    const msg = document.getElementById("msg");

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        msg.textContent = '';
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Accept' : 'application/json', 'Content-Type' : 'application/json' },
                body: JSON.stringify({ email:usuario, password:contrasena})
            });
        
            const data = await rest.json();

            if (!res.ok) {
                msg.textContent = data?.message || 'Error al iniciar sesión.';
                return;
            }

            if (!data.token) {
                msg.textContent = 'Login sin token. Revisa Sanctum.';
                return;
            }

            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';

        } catch (err) {
            msg.textContent = 'Error: ' + err.message;
        }
    });
});