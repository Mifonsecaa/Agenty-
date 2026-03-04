"use client";
import { useEffect, useRef } from "react";

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Hacer que el canvas ocupe toda la ventana
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray: Particle[] = [];

        // Rastrear la posición del mouse
        let mouse = {
            x: null as number | null,
            y: null as number | null,
            radius: 120 // El radio de empuje del cursor
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Clase que define cómo se ve y se mueve cada partícula
        class Particle {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            size: number;
            density: number;
            color: string;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x; // Guardamos su posición original para que regrese
                this.baseY = y;
                this.size = Math.random() * 2 + 0.5; // Tamaño del punto
                this.density = (Math.random() * 30) + 1; // Peso para el empuje

                // Colores sutiles para combinar con tu fondo oscuro
                const colors = ['rgba(255, 255, 255, 0.2)', 'rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = this.color;
            }

            update() {
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    // Fuerza de repulsión (si está cerca, se aleja)
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Si el mouse se aleja, la partícula regresa a su posición original
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / 10;
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / 10;
                        }
                    }
                }
                this.draw();
            }
        }

        // Inicializar los puntos
        function init() {
            particlesArray = [];
            // Generar 300 puntos en pantalla
            for (let i = 0; i < 300; i++) {
                let x = Math.random() * canvas!.width;
                let y = Math.random() * canvas!.height;
                particlesArray.push(new Particle(x, y));
            }
        }

        // El motor de animación
        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas!.width, canvas!.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();

        // Reajustar si el usuario cambia el tamaño de la ventana
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
}