"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { CloudinaryResource, CloudinaryResponse } from "../types/responseCloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisualizerContext } from "../context/visualizer";
import { useLanguageContext } from "../context/changeLanguage";

async function getMedia() {
    const res = await fetch(`/api/getData?folder=tatto`, {});
    if (!res.ok) {
        return false;
    }
    return await res.json();
}

export default function Tatto() {
    const { t } = useLanguageContext();
    const { visualizerImage, updateImagesToVisualizer } = useVisualizerContext();
    const [images, setImages] = useState<CloudinaryResource[]>([]);
    const [isDownloadingImages, setIsDownloadingImages] = useState<boolean>(true);
    useEffect(() => {
        (async () => {
            const media: CloudinaryResponse = await getMedia();
            if (media) {
                setImages(media.resources)
                setIsDownloadingImages(false)
                updateImagesToVisualizer(media.resources)

            }
        })();
    }, []);
    return (
        <>
            <section className="min-h-screen flex  lg:flex-col w-full contentMainTatto">
                <main className="flex-1 flex flex-col items-center justify-center">
                    <div className="p-10 md:p-56">
                        <div className="flex items-center justify-center">
                            <h1 className="text-8xl text-gray-600">{t("tatto_title")}</h1>
                        </div>
                        <div className="flex items-center justify-center ">
                            <h5 className="text-center">
                                {t("tatto_description")}
                            </h5>
                        </div>
                    </div>
                </main>
            </section>
            <section className=" flex  lg:flex-col w-full contentMainTatto2 ">
                {isDownloadingImages && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 px-12 py-12">
                        {Array.from({ length: 25 }).map((_, i) => {
                            return (
                                <div
                                    key={i}
                                    className="aspect-square rounded-sm overflow-hidden break-inside-avoid mb-10"
                                >
                                    <Skeleton className="w-full h-full" />
                                </div>
                            )
                        })}
                    </div>
                )}
                <div className="px-12 py-12">
                    <div className="columns-3 md:columns-3 lg:columns-5 space-y-4 gap-4 sm:gap-10 md:gap-10 lg:gap-20">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="break-inside-avoid mb-10 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                            >
                                <img
                                    onClick={() => visualizerImage(image)}
                                    src={image.secure_url || "/placeholder.svg"}
                                    alt={`Gallery image ${index + 1}`}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}