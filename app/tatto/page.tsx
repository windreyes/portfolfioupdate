"use client"

import { useEffect, useState } from "react"
import { CloudinaryResource } from "../types/responseCloudinary"
import { useLanguageContext } from "../context/changeLanguage"
import { useVisualizerContext } from "../context/visualizer"
import { Play } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TattoProject {
    name: string
    path: string
    files: CloudinaryResource[]
    loading: boolean
}

// Gallery/carousel indicator — two overlapping rounded squares
function MultiImageIcon() {
    return (
        <div className="relative w-[22px] h-[22px] drop-shadow-md">
            {/* Back square — offset bottom-left */}
            <div className="absolute bottom-0 left-0 w-[16px] h-[16px] rounded-[4px] bg-white/70" />
            {/* Front square — offset top-right */}
            <div className="absolute top-0 right-0 w-[16px] h-[16px] rounded-[4px] bg-white" />
        </div>
    )
}

function ProjectCard({ project, onOpen }: { project: TattoProject; onOpen: () => void }) {
    const cover = project.files[0]
    const hasMultiple = project.files.length > 1

    return (
        <div
            onClick={onOpen}
            className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group relative flex"
        >
            {project.loading ? (
                <div className="aspect-square">
                    <Skeleton className="w-full h-full" />
                </div>
            ) : cover ? (
                cover.resource_type === "video" ? (
                    <>
                        <video
                            src={cover.secure_url}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                            preload="metadata"
                            muted
                            playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <Play className="w-8 h-8 text-white drop-shadow-lg fill-white" />
                        </div>
                    </>
                ) : (
                    <img
                        src={cover.secure_url}
                        alt={project.name}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                )
            ) : (
                <div className="aspect-square bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-white/20 text-xs uppercase tracking-widest">empty</span>
                </div>
            )}

            {/* Multi-image indicator */}
            {hasMultiple && (
                <div className="absolute top-2 right-2 z-10">
                    <MultiImageIcon />
                </div>
            )}

            {/* Project name overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10
                bg-gradient-to-t from-black/70 to-transparent px-2 py-2
                opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs font-light tracking-wide capitalize truncate">
                    {project.name.replace(/-/g, " ")}
                </p>
            </div>
        </div>
    )
}

export default function Tatto() {
    const { t, isHonest, setIsFloatElement } = useLanguageContext()
    const { visualizerImage, updateImagesToVisualizer } = useVisualizerContext()
    const [projects, setProjects] = useState<TattoProject[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsFloatElement(true)
        return () => setIsFloatElement(false)
    }, [setIsFloatElement])

    useEffect(() => {
        ;(async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/projects/tatto")
                const data = await res.json()
                const folders: { name: string; path: string }[] = data.folders || []

                setProjects(folders.map((f) => ({ ...f, files: [], loading: true })))
                setLoading(false)

                const results = await Promise.all(
                    folders.map(async (f) => {
                        try {
                            const r = await fetch(`/api/getData?folder=tatto/${encodeURIComponent(f.name)}`)
                            const d = await r.json()
                            return { ...f, files: d.resources || [], loading: false }
                        } catch {
                            return { ...f, files: [], loading: false }
                        }
                    })
                )
                setProjects(results)
            } catch {
                setProjects([])
                setLoading(false)
            }
        })()
    }, [])

    function handleOpen(project: TattoProject) {
        if (!project.files.length) return
        updateImagesToVisualizer(project.files)
        visualizerImage(project.files[0])
    }

    return (
        <section
            className="p-8 lg:p-12 sectionPhotoList min-h-screen"
            style={{
                backgroundImage: "url(/images/texture.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="py-8 lg:py-12 w-full">
                <h1 className="header1Main flex justify-start" style={{ color: "#151515" }}>
                    {t("tatto_title")}
                </h1>
                <div className="space-y-2">
                    <p className="pMainDesc" style={{ color: "#151515" }}>
                        {t(isHonest ? "tatto_description_honest" : "tatto_description")}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <p className="text-[#151515]/50 text-sm tracking-wide">No projects yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.name}
                            project={project}
                            onOpen={() => handleOpen(project)}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
