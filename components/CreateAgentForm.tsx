// Ejemplo básico de cómo lo llamarías desde tu Frontend
const crearAgente = async (descripcionUsuario: string) => {
    const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRequest: descripcionUsuario })
    });

    const data = await res.json();
    console.log("¡Agente creado!", data.agent);
}