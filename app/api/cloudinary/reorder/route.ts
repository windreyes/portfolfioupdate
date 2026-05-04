import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export const runtime = "nodejs"

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!)

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

async function requireAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value
    if (!token) return false
    try { await jwtVerify(token, key(), { algorithms: ["HS256"] }); return true } catch { return false }
}

interface ReorderItem {
    publicId: string
    resourceType: string
    sortOrder: number
}

export async function PATCH(req: Request) {
    if (!(await requireAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let items: ReorderItem[] = []
    try {
        const body = await req.json()
        items = body.items ?? []
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    if (!items.length) {
        return NextResponse.json({ ok: true, updated: 0 })
    }

    const results = await Promise.allSettled(
        items.map((item) =>
            cloudinary.api.update(item.publicId, {
                context: `sort_order=${item.sortOrder}`,
                resource_type: item.resourceType as any,
            })
        )
    )

    const failed = results.filter((r) => r.status === "rejected").length
    return NextResponse.json({ ok: true, updated: items.length - failed, failed })
}
