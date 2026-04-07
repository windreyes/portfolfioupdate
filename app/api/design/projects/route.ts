import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const cloudName = () => process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const apiKey = () => process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const apiSecret = () => process.env.CLOUDINARY_API_SECRET!;
const designFolder = () =>
  `${(process.env.CLOUDINARY_FOLDER || "portfolioW").trim()}/design`;

function basicAuth() {
  return (
    "Basic " + Buffer.from(`${apiKey()}:${apiSecret()}`).toString("base64")
  );
}

function sanitizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, "")
    .replace(/\s+/g, "-");
}

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET!)
    );
    return true;
  } catch {
    return false;
  }
}

// GET — list project subfolders under portfolioW/design
export async function GET() {
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName()}/folders/${designFolder()}`,
    { headers: { Authorization: basicAuth() }, cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 404) return NextResponse.json({ folders: [] });
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ folders: data.folders || [] });
}

// POST — create a new project folder
export async function POST(req: Request) {
  if (!(await verifyAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string")
    return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const safeName = sanitizeName(name);
  if (!safeName)
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const path = `${designFolder()}/${safeName}`;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName()}/folders/${path}`,
    { method: "POST", headers: { Authorization: basicAuth() } }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json({ success: true, name: safeName, path });
}

// DELETE — delete project folder and all its resources
export async function DELETE(req: Request) {
  if (!(await verifyAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const folderPath = `${designFolder()}/${name}`;
  const cloud = cloudName();
  const auth = basicAuth();

  // 1. Fetch all resources in this project folder
  let allResources: any[] = [];
  let nextCursor: string | undefined;
  do {
    const url = new URL(
      `https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder`
    );
    url.searchParams.set("asset_folder", folderPath);
    url.searchParams.set("max_results", "500");
    if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

    const r = await fetch(url.toString(), {
      headers: { Authorization: auth },
      cache: "no-store",
    });
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
      const params = new URLSearchParams();
      batch.forEach((id) => params.append("public_ids[]", id));
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/resources/${type}/upload?${params}`,
        { method: "DELETE", headers: { Authorization: auth } }
      );
    }
  }

  // 3. Delete the now-empty folder
  await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/folders/${folderPath}`,
    { method: "DELETE", headers: { Authorization: auth } }
  );

  return NextResponse.json({ success: true });
}
