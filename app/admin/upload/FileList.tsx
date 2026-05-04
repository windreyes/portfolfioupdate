"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Eye, FileText, Loader2, GripVertical } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  url: string
}

interface FileListProps {
  files: UploadedFile[]
  onFileDelete: (fileId: string) => void
  onReorder?: (orderedIds: string[]) => void
  isDeleting?: (id: string) => boolean
}

function FileThumbnail({ file }: { file: UploadedFile }) {
  const isImage = file.type === "image" || file.type.startsWith("image/")
  const isVideo = file.type === "video" || file.type.startsWith("video/")

  if (isImage) {
    return (
      <img
        src={file.url}
        alt={file.name}
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
        loading="lazy"
      />
    )
  }
  if (isVideo) {
    return (
      <video
        src={file.url}
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
        preload="metadata"
        muted
        playsInline
      />
    )
  }
  return (
    <div className="w-16 h-16 rounded-md flex-shrink-0 bg-muted flex items-center justify-center">
      <FileText className="w-6 h-6 text-muted-foreground" />
    </div>
  )
}

function getTypeBadgeColor(type: string) {
  if (type === "image" || type.startsWith("image/")) return "bg-green-100 text-green-800"
  if (type === "video" || type.startsWith("video/")) return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-800"
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function SortableFileRow({
  file,
  onFileDelete,
  isDeleting,
}: {
  file: UploadedFile
  onFileDelete: (id: string) => void
  isDeleting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const date = file.uploadDate instanceof Date ? file.uploadDate : new Date(file.uploadDate)
  const typeLabel = file.type.includes("/") ? file.type.split("/")[0] : file.type

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border border-border rounded-lg transition-colors bg-background
        ${isDragging ? "opacity-50 shadow-lg z-50" : ""}
        ${isDeleting ? "opacity-60 pointer-events-none" : "hover:bg-muted/50"}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Thumbnail */}
      <FileThumbnail file={file} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate text-sm">{file.name}</p>
          <Badge variant="secondary" className={`text-xs flex-shrink-0 ${getTypeBadgeColor(file.type)}`}>
            {typeLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{isNaN(date.getTime()) ? "-" : date.toLocaleDateString()}</span>
          {isDeleting && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando…
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
          <a href={file.url} download={file.name}>
            <Download className="w-4 h-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFileDelete(file.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isDeleting}
          aria-label="Eliminar"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

export function FileList({ files, onFileDelete, onReorder, isDeleting }: FileListProps) {
  const [ordered, setOrdered] = useState<UploadedFile[]>(files)

  // Sync when files prop changes (new upload, delete, initial load)
  useEffect(() => {
    setOrdered(files)
  }, [files])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ordered.findIndex((f) => f.id === active.id)
    const newIndex = ordered.findIndex((f) => f.id === over.id)
    const newOrder = arrayMove(ordered, oldIndex, newIndex)

    setOrdered(newOrder)
    onReorder?.(newOrder.map((f) => f.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {ordered.map((file) => (
            <SortableFileRow
              key={file.id}
              file={file}
              onFileDelete={onFileDelete}
              isDeleting={isDeleting?.(file.id) ?? false}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
