"use client";
import { Plus, Mic, ArrowUp, Sparkles, X, FileText, Image as ImageIcon, File, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const PLACEHOLDER_PHRASES = [
    "Cuéntame sobre tu negocio para crear tu agente...",
    "Por ejemplo: 'Tengo una clínica dental y necesito agendar citas'",
    "Por ejemplo: 'Vendo zapatos online y quiero responder dudas'",
    "Por ejemplo: 'Soy abogado y necesito calificar leads legales'",
    "Describe tu caso de uso ideal aquí..."
];

const DOC_LOADING_PHRASES = [
    "Escaneando documento...",
    "Extrayendo precios y servicios...",
    "Construyendo base de conocimiento...",
];

const TEXT_LOADING_PHRASES = [
    "Analizando tu negocio...",
    "Diseñando personalidad del agente...",
    "Generando configuración inicial...",
];

interface MagicBoxProps {
    onSubmit: (text: string, files?: File[]) => void;
    isLoading: boolean;
}

export default function MagicBox({ onSubmit, isLoading }: MagicBoxProps) {
    const [text, setText] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const fileMenuRef = useRef<HTMLDivElement>(null);
    const [fileAccept, setFileAccept] = useState<string>("");
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

    // --- Efecto Typewriter para el Placeholder ---
    const [placeholderText, setPlaceholderText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];
        const typingSpeed = isDeleting ? 30 : 60; // Más rápido al borrar
        const pauseTime = isDeleting ? 500 : 2500; // Pausa al final de escribir/borrar

        const handleTyping = () => {
            if (!isDeleting && placeholderText === currentPhrase) {
                // Terminó de escribir, esperar y empezar a borrar
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && placeholderText === "") {
                // Terminó de borrar, pasar a la siguiente frase
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
            } else {
                // Escribir o borrar el siguiente caracter
                const nextText = isDeleting
                    ? currentPhrase.substring(0, placeholderText.length - 1)
                    : currentPhrase.substring(0, placeholderText.length + 1);
                setPlaceholderText(nextText);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholderText, isDeleting, phraseIndex]);

    useEffect(() => {
        if (!isLoading) {
            setLoadingPhraseIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setLoadingPhraseIndex((prev) => prev + 1);
        }, 1800);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setShowFileMenu(false);
            }
        };

        if (showFileMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showFileMenu]);

    useEffect(() => {
        if (isLoading && showFileMenu) {
            setShowFileMenu(false);
        }
    }, [isLoading, showFileMenu]);

    // Manejar botón Plus
    const handleFileMenuClick = () => {
        setShowFileMenu(!showFileMenu);
    };

    const handleFileTypeSelect = (accept: string) => {
        setFileAccept(accept);
        setShowFileMenu(false);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 100);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachedFiles(prev => [...prev, ...files]);
        setFileAccept("");
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Manejar botón de voz
    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                    void new Blob(chunks, { type: 'audio/webm' });
                    // Aquí podrías enviar el audio a un servicio de transcripción
                    setText(prev => prev + " [Audio grabado - pendiente transcripción]");
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
            } catch (error) {
                console.error("Error al acceder al micrófono:", error);
                toast.error("No se pudo acceder al micrófono. Verifica los permisos.");
            }
        } else {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        }
    };

    const [isImproving, setIsImproving] = useState(false);

    const hasAttachedFiles = attachedFiles.length > 0;
    const loadingPhrases = hasAttachedFiles ? DOC_LOADING_PHRASES : TEXT_LOADING_PHRASES;
    const loadingMessage = loadingPhrases[loadingPhraseIndex % loadingPhrases.length];

    const handleImproveWithAI = async () => {
        if (!text || text.length < 5 || isImproving) return;
        setIsImproving(true);

        try {
            const res = await fetch("/api/improve-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                toast.error("No se pudo mejorar el texto en este momento.");
                return;
            }

            const data = await res.json();
            if (data.success && data.improved) {
                setText(data.improved);
                toast.success("¡Descripción mejorada por la IA! ✨");
            }
        } catch (error) {
            console.error(error);
            toast.error("No se pudo mejorar el texto en este momento.");
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto group z-20">
            {/* Contenedor principal estilo Glassmorphism */}
            <div className="relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out focus-within:border-white/30 focus-within:bg-white/8 focus-within:shadow-[0_0_40px_rgba(255,255,255,0.05)]">

                {/* Input Area */}
                <textarea
                    rows={4}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white/90 placeholder-white/40 resize-none text-xl sm:text-2xl font-light py-4 px-3 leading-relaxed transition-all focus:placeholder-white/20"
                    placeholder={placeholderText}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading}
                />

                {/* Archivos adjuntos */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 px-3">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white/80 text-sm group/file hover:bg-white/15 transition-all">
                                {file.type.startsWith('image/') ? (
                                    <ImageIcon size={16} className="text-blue-400" />
                                ) : (
                                    <FileText size={16} className="text-purple-400" />
                                )}
                                <span className="max-w-37.5 truncate">{file.name}</span>
                                <button
                                    onClick={() => removeFile(index)}
                                    disabled={isLoading}
                                    className="opacity-0 group-hover/file:opacity-100 transition-opacity hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input oculto para archivos */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={fileAccept || "image/*,.pdf,.doc,.docx,.txt"}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Controles de abajo */}
                <div className="flex items-center justify-between mt-6 px-1">
                    <div className="flex items-center gap-3 relative">
                        <button
                            onClick={handleFileMenuClick}
                            disabled={isLoading}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/70 transition-all duration-300 hover:scale-105 active:scale-95 group-focus-within:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Añadir contexto (Imágenes/Docs)"
                        >
                            <Plus size={22} />
                        </button>

                        {/* Menú desplegable de tipos de archivo */}
                        {showFileMenu && (
                            <div
                                ref={fileMenuRef}
                                className="absolute top-full left-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-50 animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => handleFileTypeSelect("image/*")}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group"
                                    >
                                        <ImageIcon size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Imagen</span>
                                    </button>
                                    <button
                                        onClick={() => handleFileTypeSelect(".pdf")}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group"
                                    >
                                        <FileText size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">PDF</span>
                                    </button>
                                    <button
                                        onClick={() => handleFileTypeSelect(".doc,.docx")}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group"
                                    >
                                        <File size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Documento</span>
                                    </button>
                                    <button
                                        onClick={() => handleFileTypeSelect(".txt")}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group"
                                    >
                                        <FileText size={18} className="text-gray-400 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Texto</span>
                                    </button>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button
                                        onClick={() => handleFileTypeSelect("*")}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group"
                                    >
                                        <Plus size={18} className="text-white/60 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Todos</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-5">
                        <span className="text-xs font-semibold text-white/30 tracking-[0.15em] uppercase pointer-events-none transition-colors group-focus-within:text-white/50">
                            Build
                        </span>

                        <div className="h-4 w-px bg-white/10" />

                        <button
                            onClick={toggleRecording}
                            disabled={isLoading}
                            className={`p-3 rounded-full transition-all duration-300 active:scale-95 ${isRecording
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                                : 'hover:bg-white/10 text-white/50 hover:text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isRecording ? "Detener grabación" : "Usar dictado por voz"}
                        >
                            <Mic size={22} />
                        </button>

                        <button
                            onClick={() => onSubmit(text, attachedFiles)}
                            disabled={isLoading || !text}
                            className={`p-3.5 rounded-full transition-all duration-500 flex items-center justify-center ${text
                                ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95'
                                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                }`}
                        >
                            <ArrowUp size={22} className={text ? "stroke-[3px]" : "stroke-[2px]"} />
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="mt-4 px-2" aria-live="polite">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                            <Loader2 size={14} className="animate-spin text-emerald-300" />
                            <span>{loadingMessage}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Badge - Now a functional button */}
            <button
                onClick={handleImproveWithAI}
                disabled={isImproving || !text || text.length < 5}
                className={`absolute -right-3 -top-4 bg-linear-to-br from-indigo-500/80 to-purple-500/80 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-xl shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all z-30 group/spark ${isImproving ? 'animate-pulse' : 'animate-float'}`}
                title="Mejorar con IA"
            >
                <Sparkles size={18} className={`text-white transition-all ${isImproving ? 'animate-spin' : 'group-hover/spark:rotate-12'}`} />
                {isImproving && (
                    <span className="absolute left-full ml-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded-md border border-white/10 whitespace-nowrap">
                        Mejorando...
                    </span>
                )}
            </button>
        </div>
    );
}
