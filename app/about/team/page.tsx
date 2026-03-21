import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';

const teamMembers = [
    {
        name: "David",
        role: "Co-Founder & Backend Engineer",
        bio: "Experto en arquitecturas escalables y bases de datos. Apasionado por optimizar el rendimiento y la seguridad del sistema.",
        image: null, // Placeholder para la foto
        social: {
            github: "#",
            linkedin: "#",
            twitter: "#"
        }
    },
    {
        name: "Haisonbel",
        role: "Co-Founder & Product Designer",
        bio: "Diseñador de producto y especialista en experiencia de usuario. Creador de la visión interactiva y premium de brainia.",
        image: null,
        social: {
            github: "#",
            linkedin: "#",
            twitter: "#"
        }
    },
    {
        name: "Miguel",
        role: "Co-Founder & AI Engineer",
        bio: "Especialista en inteligencia artificial y modelos de lenguaje. Encargado de darle vida a los agentes cognitivos.",
        image: null,
        social: {
            github: "#",
            linkedin: "#",
            twitter: "#"
        }
    }
];

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-32 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Conoce al equipo detrás de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">brainia</span>
                    </h1>
                    <p className="text-lg text-white/60">
                        Somos un equipo de ingenieros, diseñadores y soñadores apasionados por democratizar el acceso a la inteligencia artificial para negocios de todos los tamaños.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="group relative flex flex-col p-6 rounded-3xl border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-[#111111] hover:-translate-y-1 shadow-2xl shadow-black"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full aspect-[4/5] rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/10 relative flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
                                {member.image ? (
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={member.image} 
                                            alt={member.name} 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-white/30 group-hover:text-blue-400/50 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <span className="text-2xl font-medium">{member.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-xs font-medium uppercase tracking-widest">Añadir Foto</span>
                                    </div>
                                )}
                            </div>

                            {/* Member Info */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xl font-bold tracking-tight text-white mb-1 group-hover:text-blue-400 transition-colors">{member.name}</h3>
                                <p className="text-sm font-medium text-purple-400 mb-4">{member.role}</p>
                                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1">
                                    {member.bio}
                                </p>

                                {/* Social Links */}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <a href={member.social.github} className="text-white/40 hover:text-white transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href={member.social.twitter} className="text-white/40 hover:text-[#1DA1F2] transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href={member.social.linkedin} className="text-white/40 hover:text-[#0A66C2] transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors ml-auto">
                                        <Mail className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
