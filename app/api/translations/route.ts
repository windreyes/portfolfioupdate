import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

const TRANSLATIONS_PATH = path.join(process.cwd(), "data", "translations.json")

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!)

async function requireAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value
    if (!token) return false
    try { await jwtVerify(token, key(), { algorithms: ["HS256"] }); return true } catch { return false }
}

function readTranslations() {
    try {
        if (!fs.existsSync(TRANSLATIONS_PATH)) return null
        return JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, "utf-8"))
    } catch { return null }
}

export async function GET() {
    const data = readTranslations()
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(data)
}

export async function PUT(req: Request) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const body = await req.json()
        if (!body.en || !body.es) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
        const dir = path.dirname(TRANSLATIONS_PATH)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(TRANSLATIONS_PATH, JSON.stringify(body, null, 2), "utf-8")
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
