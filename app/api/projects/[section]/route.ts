import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const ALLOWED_SECTIONS = ["tatto", "design"] as const;
type AllowedSection = typeof ALLOWED_SECTIONS[number];

const cloudName = () => process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const apiKey = () => process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const apiSecret = () => process.env.CLOUDINARY_API_SECRET!;

function sectionFolder(section: string) {
    return `${(process.env.CLOUDINARY_FOLDER || "portfolioW").trim()}/${section}`;
}

function basicAuth() {
    return "Basic " + Buffer.from(`${apiKey()}:${apiSecret()}`).toString("base64");
}

function sanitizeName(name: string) {
    return name.trim().toLowerCase().replace(/[^a-z0-9\s\-_]/g, "").replace(/\s+/g, "-");
}

async function verifyAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET!));
        return true;
    } catch { return false; }
}

function getSection(params: { section: string }): AllowedSection | null {
    const s = params.section as AllowedSection;
    return ALLOWED_SECTIONS.includes(s) ? s : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ section: string }> }) {
    const { section } = await params;
    const safeSection = getSection({ section });
    if (!safeSection) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

    const folder = sectionFolder(safeSection);
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName()}/folders/${folder}`,
        { headers: { Authorization: basicAuth() }, cache: "no-store" }
    );

    if (!res.ok) {
        if (res.status === 404) return NextResponse.json({ folders: [] });
        return NextResponse.json({ error: await res.text() }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ folders: data.folders || [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ section: string }> }) {
    if (!(await verifyAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { section } = await params;
    const safeSection = getSection({ section });
    if (!safeSection) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

    const { name } = await req.json();
    if (!name || typeof name !== "string") return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const safeName = sanitizeName(name);
    if (!safeName) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

    const path = `${sectionFolder(safeSection)}/${safeName}`;
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName()}/folders/${path}`,
        { method: "POST", headers: { Authorization: basicAuth() } }
    );

    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
    return NextResponse.json({ success: true, name: safeName, path });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ section: string }> }) {
    if (!(await verifyAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { section } = await params;
    const safeSection = getSection({ section });
    if (!safeSection) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const folderPath = `${sectionFolder(safeSection)}/${name}`;
    const cloud = cloudName();
    const auth = basicAuth();

    // 1. Fetch all resources in this folder
    let allResources: any[] = [];
    let nextCursor: string | undefined;
    do {
        const url = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder`);
        url.searchParams.set("asset_folder", folderPath);
        url.searchParams.set("max_results", "500");
        if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

        const r = await fetch(url.toString(), { headers: { Authorization: auth }, cache: "no-store" });
        if (!r.ok) break;
        const d = await r.json();
        allResources = [...allResources, ...(d.resources || [])];
        nextCursor = d.next_cursor;
    } while (nextCursor);

    // 2. Delete resources grouped by resource_type in batches of 100
    const byType: Record<string, string[]> = {};
    for (const r of allResources) {
        const t = r.resource_type || "image";
        if (!byType[t]) byType[t] = [];
        byType[t].push(r.public_id);
    }
    for (const [type, ids] of Object.entries(byType)) {
        for (let i = 0; i < ids.length; i += 100) {
            const batch = ids.slice(i, i + 100);
            const p = new URLSearchParams();
            batch.forEach((id) => p.append("public_ids[]", id));
            await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/${type}/upload?${p}`,
                { method: "DELETE", headers: { Authorization: auth } }
            );
        }
    }

    // 3. Delete the empty folder
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/folders/${folderPath}`,
        { method: "DELETE", headers: { Authorization: auth } }
    );

    return NextResponse.json({ success: true });
}
