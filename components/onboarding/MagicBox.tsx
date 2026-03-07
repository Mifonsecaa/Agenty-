"use client";
import { Plus, Mic, ArrowUp, Sparkles, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const PLACEHOLDER_PHRASES = [
    "Cuéntame sobre tu negocio para crear tu agente...",
    "Por ejemplo: 'Tengo una clínica dental y necesito agendar citas'",
    "Por ejemplo: 'Vendo zapatos online y quiero responder dudas'",
    "Por ejemplo: 'Soy abogado y necesito calificar leads legales'",
    "Describe tu caso de uso ideal aquí..."
];

export default function MagicBox() {
    // --- ESTADOS DE LA UI ---
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Estado de carga integrado
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const fileMenuRef = useRef<HTMLDivElement>(null);
    const [fileAccept, setFileAccept] = useState<string>("");

    // --- EFECTO TYPEWRITER ---
    const [placeholderText, setPlaceholderText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];
        const typingSpeed = isDeleting ? 30 : 60;
        const pauseTime = isDeleting ? 500 : 2500;

        const handleTyping = () => {
            if (!isDeleting && placeholderText === currentPhrase) {
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && placeholderText === "") {
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
            } else {
                const nextText = isDeleting
                    ? currentPhrase.substring(0, placeholderText.length - 1)
                    : currentPhrase.substring(0, placeholderText.length + 1);
                setPlaceholderText(nextText);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholderText, isDeleting, phraseIndex]);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setShowFileMenu(false);
            }
        };
        if (showFileMenu) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFileMenu]);

    // --- MANEJO DE ARCHIVOS ---
    const handleFileMenuClick = () => setShowFileMenu(!showFileMenu);

    const handleFileTypeSelect = (accept: string) => {
        setFileAccept(accept);
        setShowFileMenu(false);
        setTimeout(() => fileInputRef.current?.click(), 100);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachedFiles(prev => [...prev, ...files]);
        setFileAccept("");
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // --- MANEJO DE VOZ ---
    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    setText(prev => prev + " [Audio grabado - pendiente transcripción]");
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
            } catch (error) {
                toast.error("No se pudo acceder al micrófono.");
            }
        } else {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        }
    };

    // --- CONEXIÓN AL BACKEND (LA MAGIA REAL) ---
    const handleSendToDB = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        const toastId = toast.loading("Analizando tu negocio y creando la base de datos...");

        try {
            // Enviamos el texto a nuestra API
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error desconocido");

            toast.success("¡Base de datos y agente creados con éxito!", { id: toastId });

            // Limpiamos la caja después de enviarlo
            setText("");
            setAttachedFiles([]);

        } catch (error) {
            toast.error("Hubo un error al crear el agente.", { id: toastId });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto group z-20">
            <div className="relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out focus-within:border-white/30 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_40px_rgba(255,255,255,0.05)]">

                <textarea
                    rows={4}
                    disabled={isLoading}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white/90 placeholder-white/40 resize-none text-xl sm:text-2xl font-light py-4 px-3 leading-relaxed transition-all focus:placeholder-white/20 disabled:opacity-50"
                    placeholder={placeholderText}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 px-3">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white/80 text-sm group/file hover:bg-white/15 transition-all">
                                {file.type.startsWith('image/') ? (
                                    <ImageIcon size={16} className="text-blue-400" />
                                ) : (
                                    <FileText size={16} className="text-purple-400" />
                                )}
                                <span className="max-w-[150px] truncate">{file.name}</span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="opacity-0 group-hover/file:opacity-100 transition-opacity hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={fileAccept || "image/*,.pdf,.doc,.docx,.txt"}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex items-center justify-between mt-6 px-1">
                    <div className="flex items-center gap-3 relative">
                        <button
                            onClick={handleFileMenuClick}
                            disabled={isLoading}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/70 transition-all duration-300 hover:scale-105 active:scale-95 group-focus-within:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={22} />
                        </button>

                        {showFileMenu && (
                            <div ref={fileMenuRef} className="absolute top-full left-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2">
                                    <button onClick={() => handleFileTypeSelect("image/*")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group">
                                        <ImageIcon size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Imagen</span>
                                    </button>
                                    <button onClick={() => handleFileTypeSelect(".pdf")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group">
                                        <FileText size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">PDF</span>
                                    </button>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button onClick={() => handleFileTypeSelect("*")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 text-left group">
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
                            className={`p-3 rounded-full transition-all duration-300 active:scale-95 ${isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse' : 'hover:bg-white/10 text-white/50 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Mic size={22} />
                        </button>
                        <button
                            onClick={handleSendToDB} // Aquí ejecutamos nuestra nueva función
                            disabled={isLoading || !text}
                            className={`p-3.5 rounded-full transition-all duration-500 flex items-center justify-center ${text ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
                        >
                            <ArrowUp size={22} className={text ? "stroke-[3px]" : "stroke-[2px]"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute -right-3 -top-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-xl shadow-purple-500/10 pointer-events-none animate-float">
                <Sparkles size={18} className="text-blue-300" />
            </div>
        </div>
    );
}