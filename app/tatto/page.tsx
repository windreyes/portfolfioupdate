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
    const { t, isHonest, setIsFloatElement } = useLanguageContext();
    const { visualizerImage, updateImagesToVisualizer } = useVisualizerContext();
    const [images, setImages] = useState<CloudinaryResource[]>([]);
    const [isDownloadingImages, setIsDownloadingImages] = useState<boolean>(true);

    useEffect(() => {
        setIsFloatElement(true);
        return () => setIsFloatElement(false);
    }, [setIsFloatElement]);

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
            <section
                className="p-8 lg:p-12 sectionPhotoList min-h-screen"
                style={{
                    backgroundImage: 'url(/images/texture.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="py-8 lg:py-12 w-full">
                    <h1 className="header1Main flex justify-start" style={{ color: '#151515' }}>{t("tatto_title")}</h1>
                    <div className="space-y-2">
                        <p className="pMainDesc" style={{ color: '#151515' }}>
                            {t(isHonest ? "tatto_description_honest" : "tatto_description")}
                        </p>
                    </div>
                </div>

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

                {isDownloadingImages && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-sm overflow-hidden"
                            >
                                <Skeleton className="w-full h-full" />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}