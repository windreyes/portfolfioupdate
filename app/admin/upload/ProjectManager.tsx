"use client";

import { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { FileList } from "./FileList";
import { FolderPlus, Trash2, ArrowLeft, Loader2, Upload } from "lucide-react";

interface Project { name: string; path: string }

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
    url: string;
    publicId: string;
    resourceType: "image" | "video" | "raw";
    inCloudinary: boolean;
}

interface ProjectManagerProps {
    section: string;         // e.g. "tatto"
    label?: string;          // display label, e.g. "Tattoo"
}

export default function ProjectManager({ section, label }: ProjectManagerProps) {
    const apiBase = `/api/projects/${section}`;

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectFiles, setProjectFiles] = useState<UploadedFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);
    const [deletingProject, setDeletingProject] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    useEffect(() => { loadProjects(); }, []);
    useEffect(() => { if (selectedProject) loadProjectFiles(selectedProject.name); }, [selectedProject]);

    async function loadProjects() {
        setLoadingProjects(true);
        try {
            const res = await fetch(apiBase);
            const data = await res.json();
            setProjects(data.folders || []);
        } catch { toast.error("Could not load projects"); }
        finally { setLoadingProjects(false); }
    }

    async function loadProjectFiles(projectName: string) {
        setLoadingFiles(true);
        try {
            const res = await fetch(`/api/getData?folder=${section}/${encodeURIComponent(projectName)}`);
            const data = await res.json();
            const files: UploadedFile[] = (data.resources || []).map((r: any) => ({
                id: r.asset_id,
                name: r.display_name ?? r.public_id?.split("/").pop() ?? "file",
                size: r.bytes,
                type: r.resource_type,
                uploadDate: new Date(r.created_at),
                url: r.secure_url,
                inCloudinary: true,
                publicId: r.public_id,
                resourceType: r.resource_type,
            }));
            setProjectFiles(files);
        } catch { toast.error("Could not load project files"); }
        finally { setLoadingFiles(false); }
    }

    async function createProject() {
        if (!newProjectName.trim()) return;
        setCreatingProject(true);
        try {
            const res = await fetch(apiBase, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newProjectName }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProjects((prev) => [...prev, { name: data.name, path: data.path }]);
            setNewProjectName("");
            toast.success(`Project "${data.name}" created`);
        } catch { toast.error("Could not create project"); }
        finally { setCreatingProject(false); }
    }

    async function deleteProject(project: Project) {
        setDeletingProject(project.name);
        try {
            const res = await fetch(apiBase, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: project.name }),
            });
            if (!res.ok) throw new Error();
            setProjects((prev) => prev.filter((p) => p.name !== project.name));
            toast.success(`Project "${project.name}" deleted`);
        } catch { toast.error("Could not delete project"); }
        finally { setDeletingProject(null); }
    }

    async function handleUpload(files: File[]) {
        if (!selectedProject || !files.length) return;
        setIsUploading(true);
        try {
            const newFiles: UploadedFile[] = [];
            let okCount = 0, errCount = 0;
            const baseIndex = projectFiles.length;

            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const seqNum = String(baseIndex + i + 1).padStart(4, "0");
                const baseName = f.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40);
                const publicId = `${seqNum}_${baseName}`;

                const sig = await fetch("/api/uploads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ section, project: selectedProject.name, publicId }),
                }).then((r) => r.json());

                const form = new FormData();
                form.append("file", f);
                form.append("api_key", sig.apiKey);
                form.append("timestamp", String(sig.timestamp));
                form.append("signature", sig.signature);
                form.append("folder", sig.folder);
                form.append("public_id", publicId);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
                    { method: "POST", body: form }
                );

                if (!res.ok) { errCount++; continue; }
                const rta = await res.json();
                okCount++;
                newFiles.push({
                    id: rta.asset_id ?? Math.random().toString(36).substr(2, 9),
                    name: rta.original_filename ?? f.name,
                    size: f.size,
                    type: rta.resource_type,
                    uploadDate: new Date(),
                    url: rta.secure_url,
                    publicId: rta.public_id,
                    resourceType: rta.resource_type ?? "image",
                    inCloudinary: true,
                });
            }

            if (newFiles.length) setProjectFiles((prev) => [...prev, ...newFiles]);
            if (errCount === 0) toast.success(`${okCount} file(s) uploaded`);
            else if (okCount > 0) toast(`${okCount} uploaded, ${errCount} failed`);
            else toast.error("No files could be uploaded");
        } catch { toast.error("Upload failed"); }
        finally { setIsUploading(false); }
    }

    function markDeleting(id: string, on: boolean) {
        setDeletingIds((prev) => { const next = new Set(prev); on ? next.add(id) : next.delete(id); return next; });
    }

    async function handleFileDelete(file: UploadedFile) {
        markDeleting(file.id, true);
        try {
            const res = await fetch("/api/cloudinary/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: file.publicId, resourceType: file.resourceType }),
            });
            if (!res.ok) throw new Error();
            setProjectFiles((prev) => prev.filter((f) => f.id !== file.id));
            toast.success("File deleted");
        } catch { toast.error("Could not delete file"); }
        finally { markDeleting(file.id, false); }
    }

    async function handleReorder(orderedIds: string[]) {
        const idToFile = Object.fromEntries(projectFiles.map((f) => [f.id, f]));
        const reordered = orderedIds.map((id) => idToFile[id]).filter(Boolean);
        setProjectFiles(reordered);

        const items = reordered.map((file, index) => ({
            publicId: file.publicId,
            resourceType: file.resourceType,
            sortOrder: index,
        }));
        try {
            const res = await fetch("/api/cloudinary/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            if (!res.ok) throw new Error();
            toast.success("Order saved");
        } catch { toast.error("Could not save order"); }
    }

    // ── Project list ────────────────────────────────────────────────────
    if (!selectedProject) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderPlus className="w-5 h-5" /> New Project
                        </CardTitle>
                        <CardDescription>
                            Create a new {label ?? section} project folder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Project name…"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && createProject()}
                            />
                            <Button onClick={createProject} disabled={creatingProject || !newProjectName.trim()}>
                                {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>{projects.length} project(s) — click to manage files</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingProjects ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No projects yet. Create one above.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {projects.map((project) => (
                                    <div
                                        key={project.name}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">📁</span>
                                            <span className="font-medium capitalize">
                                                {project.name.replace(/-/g, " ")}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); deleteProject(project); }}
                                            disabled={deletingProject === project.name}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            {deletingProject === project.name
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Trash2 className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Project detail ──────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => { setSelectedProject(null); setProjectFiles([]); }} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to projects
            </Button>

            <div className="flex items-center gap-3 pb-4 border-b border-border">
                <span className="text-3xl">📁</span>
                <div>
                    <h2 className="text-2xl font-semibold capitalize">
                        {selectedProject.name.replace(/-/g, " ")}
                    </h2>
                    <p className="text-muted-foreground text-sm">{projectFiles.length} file(s)</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Upload Files
                    </CardTitle>
                    <CardDescription>Images and videos — drag & drop or click to browse</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploadZone
                        onFilesUploaded={handleUpload}
                        acceptedTypes="image/*,video/*"
                        maxSize={500 * 1024 * 1024}
                    />
                </CardContent>
            </Card>

            {isUploading && (
                <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-neutral-900">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Uploading files…</span>
                    </div>
                </div>
            )}

            {loadingFiles ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading files…
                </div>
            ) : projectFiles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Files</CardTitle>
                        <CardDescription>{projectFiles.length} file(s) in this project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileList
                            files={projectFiles}
                            onFileDelete={(fileId) => {
                                const file = projectFiles.find((f) => f.id === fileId);
                                if (file) handleFileDelete(file);
                            }}
                            onReorder={handleReorder}
                            isDeleting={(id) => deletingIds.has(id)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
