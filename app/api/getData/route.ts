import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder") || "me";

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "portfolioW";
    const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    // Array para acumular todos los recursos
    let allResources: any[] = [];
    let nextCursor: string | undefined = undefined;
    let totalCount = 0;

    try {
        // Hacer solicitudes paginadas hasta obtener todos los recursos
        do {
            const apiUrl = new URL(
                `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder`
            );
            apiUrl.searchParams.set("asset_folder", `${CLOUDINARY_FOLDER}/${folder}`);
            apiUrl.searchParams.set("max_results", "500"); // Máximo permitido por Cloudinary
            apiUrl.searchParams.set("context", "true");

            if (nextCursor) {
                apiUrl.searchParams.set("next_cursor", nextCursor);
            }

            const res = await fetch(apiUrl.toString(), {
                method: "GET",
                headers: { Authorization: auth },
                cache: "no-store",
            });

            if (!res.ok) {
                const err = await res.text();
                return NextResponse.json({ error: err }, { status: res.status });
            }

            const data = await res.json();

            // Acumular recursos
            allResources = [...allResources, ...(data.resources || [])];
            totalCount = data.total_count || 0;
            nextCursor = data.next_cursor;

            // Evitar bucle infinito - máximo 10 iteraciones (5000 recursos)
            if (allResources.length >= totalCount || !nextCursor) {
                break;
            }
        } while (nextCursor && allResources.length < 5000);

        // Sort by sort_order context if present, otherwise keep Cloudinary's default order
        allResources.sort((a: any, b: any) => {
            const aOrder = parseInt(a.context?.custom?.sort_order ?? "", 10)
            const bOrder = parseInt(b.context?.custom?.sort_order ?? "", 10)
            const aHas = !isNaN(aOrder)
            const bHas = !isNaN(bOrder)
            if (aHas && bHas) return aOrder - bOrder
            if (aHas) return -1
            if (bHas) return 1
            return 0
        })

        return NextResponse.json({
            resources: allResources,
            total_count: totalCount,
            fetched_count: allResources.length,
        });
    } catch (error) {
        console.error("Error fetching Cloudinary resources:", error);
        return NextResponse.json(
            { error: "Failed to fetch resources" },
            { status: 500 }
        );
    }
}