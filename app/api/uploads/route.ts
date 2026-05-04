import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs" // fuerza runtime Node (no Edge)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})


const ALLOWED_SECTIONS = ["me", "design", "illustration", "photo-video", "tatto"] as const

export async function POST(req: Request) {
    let section = ""
    let project = ""
    let publicId = ""
    try {
        const body = await req.json()
        section = String(body?.section || "")
        project = String(body?.project || "")
        publicId = String(body?.publicId || "")
    } catch { /* si no hay body, section="" */ }

    // Sanitizar/whitelist para evitar carpetas arbitrarias
    const safeSection = ALLOWED_SECTIONS.includes(section as any) ? section : "misc"

    const base = (process.env.CLOUDINARY_FOLDER || "portfolioW").trim()

    // Para secciones con proyectos (design, tatto), subir a la subcarpeta del proyecto
    const SECTIONS_WITH_PROJECTS = ["design", "tatto"]
    let folder = `${base}/${safeSection}`
    if (SECTIONS_WITH_PROJECTS.includes(safeSection) && project) {
        const safeProject = project.trim().toLowerCase().replace(/[^a-z0-9\s\-_]/g, "").replace(/\s+/g, "-")
        if (safeProject) folder = `${base}/${safeSection}/${safeProject}`
    }
    const timestamp = Math.floor(Date.now() / 1000)

    // Incluye public_id en la firma solo si se proporcionó (preserva orden secuencial en design)
    const paramsToSign: Record<string, string | number> = { timestamp, folder }
    if (publicId) paramsToSign.public_id = publicId

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        publicId: publicId || null,
    })
}