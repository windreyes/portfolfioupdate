"use client";
import { useEffect, useState, useCallback } from "react";
import { CloudinaryResource } from "../types/responseCloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguageContext } from "../context/changeLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Project {
    name: string;
    path: string;
}

interface ProjectWithImages {
    project: Project;
    images: CloudinaryResource[];
    loading: boolean;
}

export default function Design() {
    const { t, isHonest, setIsFloatElement } = useLanguageContext();
    const [projects, setProjects] = useState<ProjectWithImages[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [openProject, setOpenProject] = useState<ProjectWithImages | null>(null);

    useEffect(() => {
        setIsFloatElement(true);
        return () => setIsFloatElement(false);
    }, [setIsFloatElement]);

    // Close dialog on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenProject(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Lock body scroll when dialog is open
    useEffect(() => {
        document.body.style.overflow = openProject ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [openProject]);

    useEffect(() => {
        (async () => {
            setLoadingProjects(true);
            try {
                const res = await fetch("/api/design/projects");
                const data = await res.json();
                const folders: Project[] = data.folders || [];

                setProjects(folders.map((p) => ({ project: p, images: [], loading: true })));

                const results = await Promise.all(
                    folders.map(async (p) => {
                        try {
                            const r = await fetch(
                                `/api/getData?folder=design/${encodeURIComponent(p.name)}`
                            );
                            const d = await r.json();
                            // Sort by public_id ascending to respect the sequential numbering (0001_, 0002_…)
                            const sorted = (d.resources || []).slice().sort(
                                (a: CloudinaryResource, b: CloudinaryResource) =>
                                    a.public_id.localeCompare(b.public_id)
                            );
                            return { project: p, images: sorted, loading: false };
                        } catch {
                            return { project: p, images: [], loading: false };
                        }
                    })
                );

                setProjects(results);
            } catch {
                setProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        })();
    }, []);

    const handleOpen = useCallback((pw: ProjectWithImages) => {
        setOpenProject(pw);
    }, []);

    return (
        <>
            <div className="min-h-screen flex lg:flex-col w-full contentMainIllustration">
                <main className="flex-1 flex flex-col">
                    {/* Header */}
                    <section className="bg-black p-8 lg:p-12">
                        <div className="py-8 lg:py-12 w-full">
                            <h1 className="header1Main flex justify-start">
                                {t("design_title")}
                            </h1>
                            <div className="space-y-2">
                                <p className="pMainDesc">
                                    {t(isHonest ? "design_description_honest" : "design_description")}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Behance-style project grid ─────────────────────────── */}
                    <section className="bg-black px-6 md:px-10 lg:px-14 py-8">
                        {loadingProjects ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="aspect-[4/3] w-full rounded-sm"
                                    />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="text-white/40 text-sm">No projects yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {projects.map((pw) => {
                                    const cover = pw.images[0];
                                    return (
                                        <motion.div
                                            key={pw.project.name}
                                            onClick={() => handleOpen(pw)}
                                            className="group relative aspect-[4/3] overflow-hidden bg-[#1a1a1a] cursor-pointer"
                                            whileHover={{ zIndex: 10 }}
                                        >
                                            {/* Cover image */}
                                            {cover ? (
                                                <img
                                                    src={cover.secure_url}
                                                    alt={pw.project.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#222] flex items-center justify-center">
                                                    <span className="text-white/20 text-xs uppercase tracking-widest">
                                                        empty
                                                    </span>
                                                </div>
                                            )}

                                            {/* Gradient overlay — always visible */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                            {/* Hover tint */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Project name */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <p className="text-white text-sm font-medium capitalize leading-tight">
                                                    {pw.project.name.replace(/-/g, " ")}
                                                </p>
                                                <p className="text-white/50 text-xs mt-0.5">
                                                    {pw.images.length} image{pw.images.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* ── Project detail dialog ──────────────────────────────────── */}
            <AnimatePresence>
                {openProject && (
                    <>
                        {/* Backdrop — blurs/darkens the grid behind, click to close */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-[99] bg-black/55 backdrop-blur-[4px]"
                            onClick={() => setOpenProject(null)}
                        />

                        {/* Dialog panel — centered floating card, visible grid on all sides */}
                        <motion.div
                            key="dialog"
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 24 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.85 }}
                            className="fixed z-[100] overflow-y-auto"
                            style={{
                                top: "40px",
                                bottom: 0,
                                left: "clamp(48px, 17vw, 220px)",
                                right: "clamp(48px, 17vw, 220px)",
                                backgroundColor: "#141414",
                                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.9), 0 8px 32px rgba(0,0,0,0.6)",
                                borderRadius: "4px 4px 0 0",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Sticky title bar */}
                            <div className="sticky top-0 z-[110] flex items-center justify-between px-6 md:px-10 py-4 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/[0.06]">
                                <h2 className="text-white text-base md:text-lg font-light tracking-widest uppercase capitalize">
                                    {openProject.project.name.replace(/-/g, " ")}
                                </h2>
                                <button
                                    onClick={() => setOpenProject(null)}
                                    className="text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sequential images — "single document" illusion */}
                            <div className="max-w-4xl mx-auto pt-0 pb-24">
                                {openProject.images.length === 0 ? (
                                    <div className="flex items-center justify-center h-64">
                                        <p className="text-white/30 text-sm">No images in this project.</p>
                                    </div>
                                ) : (
                                    openProject.images.map((img, i) => (
                                        <motion.div
                                            key={img.asset_id || i}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: Math.min(i * 0.06, 0.5),
                                                ease: "easeOut",
                                            }}
                                            className="w-full"
                                            style={{
                                                position: "relative",
                                            }}
                                        >
                                            <img
                                                src={img.secure_url}
                                                alt={`${openProject.project.name} — ${i + 1}`}
                                                className="w-full block"
                                                loading={i < 2 ? "eager" : "lazy"}
                                                style={{ display: "block" }}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
