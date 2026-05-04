"use client";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { CloudinaryResource, CloudinaryResponse } from "../types/responseCloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisualizerContext } from "../context/visualizer";
import { useLanguageContext } from "../context/changeLanguage";

async function getMedia() {
    const res = await fetch(`/api/getData?folder=illustration`, {});
    if (!res.ok) {
        return false;
    }
    return await res.json();
}

export default function Illustration() {
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
            <div className="min-h-screen flex  lg:flex-col w-full contentMainIllustration">
                <main className="flex-1 flex flex-col">
                    <section className="bg-black p-8 lg:p-12">
                        <div className="py-8 lg:py-12 w-full">
                            <h1 className="header1Main flex justify-start">{t("ilustration_title")}</h1>
                            <div className="space-y-2">
                                <p className="pMainDesc">
                                    {t(isHonest ? "ilustration_description_honest" : "ilustration_description")}
                                </p>
                            </div>
                        </div>
                    </section>
                    {isDownloadingImages && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-12 py-12">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-sm overflow-hidden"
                                >
                                    <Skeleton className="w-full h-full" />
                                </div>
                            ))}
                        </div>
                    )}
                    <section className="px-12 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => visualizerImage(image)}
                                    className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group relative flex"
                                >
                                    {image.resource_type === "video" ? (
                                        <>
                                            <video
                                                src={image.secure_url}
                                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                                preload="metadata"
                                                muted
                                                playsInline
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                                <Play className="w-8 h-8 text-white drop-shadow-lg fill-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={image.secure_url || "/placeholder.svg"}
                                            alt={`Gallery image ${index + 1}`}
                                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
