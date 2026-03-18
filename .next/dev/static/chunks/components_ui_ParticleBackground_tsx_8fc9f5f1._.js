(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/ParticleBackground.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ParticleBackground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ParticleBackground() {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ParticleBackground.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const isMobile = window.innerWidth < 768;
            const particleCount = prefersReducedMotion ? 40 : isMobile ? 90 : 160;
            // Hacer que el canvas ocupe toda la ventana
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            let particlesArray = [];
            let animationFrameId = null;
            let isAnimating = true;
            // Rastrear la posición del mouse
            let mouse = {
                x: null,
                y: null,
                radius: 120 // El radio de empuje del cursor
            };
            const handleMouseMove = {
                "ParticleBackground.useEffect.handleMouseMove": (event)=>{
                    mouse.x = event.x;
                    mouse.y = event.y;
                }
            }["ParticleBackground.useEffect.handleMouseMove"];
            window.addEventListener("mousemove", handleMouseMove);
            // Clase que define cómo se ve y se mueve cada partícula
            class Particle {
                x;
                y;
                baseX;
                baseY;
                size;
                density;
                color;
                constructor(x, y){
                    this.x = x;
                    this.y = y;
                    this.baseX = x; // Guardamos su posición original para que regrese
                    this.baseY = y;
                    this.size = Math.random() * 2 + 0.5; // Tamaño del punto
                    this.density = Math.random() * 30 + 1; // Peso para el empuje
                    // Colores sutiles para combinar con tu fondo oscuro
                    const colors = [
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(59, 130, 246, 0.3)',
                        'rgba(139, 92, 246, 0.3)'
                    ];
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
                        if (distance === 0) {
                            this.draw();
                            return;
                        }
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
                // Generar puntos adaptativos según dispositivo/preferencia
                for(let i = 0; i < particleCount; i++){
                    let x = Math.random() * canvas.width;
                    let y = Math.random() * canvas.height;
                    particlesArray.push(new Particle(x, y));
                }
            }
            // El motor de animación
            function animate() {
                if (!isAnimating) return;
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for(let i = 0; i < particlesArray.length; i++){
                    particlesArray[i].update();
                }
                animationFrameId = requestAnimationFrame(animate);
            }
            const handleVisibilityChange = {
                "ParticleBackground.useEffect.handleVisibilityChange": ()=>{
                    if (document.hidden) {
                        isAnimating = false;
                        if (animationFrameId !== null) {
                            cancelAnimationFrame(animationFrameId);
                            animationFrameId = null;
                        }
                        return;
                    }
                    if (!isAnimating) {
                        isAnimating = true;
                        animate();
                    }
                }
            }["ParticleBackground.useEffect.handleVisibilityChange"];
            init();
            animate();
            // Reajustar si el usuario cambia el tamaño de la ventana
            const handleResize = {
                "ParticleBackground.useEffect.handleResize": ()=>{
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    init();
                }
            }["ParticleBackground.useEffect.handleResize"];
            window.addEventListener("resize", handleResize);
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "ParticleBackground.useEffect": ()=>{
                    window.removeEventListener("mousemove", handleMouseMove);
                    window.removeEventListener("resize", handleResize);
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                    isAnimating = false;
                    if (animationFrameId !== null) {
                        cancelAnimationFrame(animationFrameId);
                    }
                }
            })["ParticleBackground.useEffect"];
        }
    }["ParticleBackground.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        className: "fixed inset-0 pointer-events-none z-0"
    }, void 0, false, {
        fileName: "[project]/components/ui/ParticleBackground.tsx",
        lineNumber: 171,
        columnNumber: 9
    }, this);
}
_s(ParticleBackground, "UJgi7ynoup7eqypjnwyX/s32POg=");
_c = ParticleBackground;
var _c;
__turbopack_context__.k.register(_c, "ParticleBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ParticleBackground.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/ParticleBackground.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_ParticleBackground_tsx_8fc9f5f1._.js.map