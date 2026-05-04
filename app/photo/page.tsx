"use client";
import React, { useEffect, useMemo, useState } from "react";
import "../photo/index.css";
import { CloudinaryResource, CloudinaryResponse } from "../types/responseCloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisualizerContext } from "../context/visualizer";
import { useLanguageContext } from "../context/changeLanguage";
import { Play } from "lucide-react";

async function getMedia() {
  const res = await fetch(`/api/getData?folder=photo-video`, {
  })
  if (!res.ok) {
    return false
  }
  return await res.json()

}

export default function Photo() {
  const {visualizerImage,updateImagesToVisualizer}=useVisualizerContext()
  const {t, isHonest, setIsFloatElement} = useLanguageContext();
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
        setImages(media.resources);
        setIsDownloadingImages(false)
        updateImagesToVisualizer(media.resources)
      }
    })();
  }, []);


  // Memoizar el grid para que solo se recalculen los nodos cuando cambie `images`
  const grid = useMemo(() => {
    if (!images) return null;
    return images.map((image, index) => (
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
    ))
  }, [images]);


  return (
    <>
      <section className="bg-black p-8 lg:p-12 sectionPhotoList">
        <div className="py-8 lg:py-12  w-full">
          <h1 className="header1Main flex justify-start ">{t("photo_title")}</h1>
          <div className="space-y-2">
            <p className="pMainDesc">
              {t(isHonest ? "photo_description_honest" : "photo_description")}
            </p>
            <p className="pMainDesc">
              {t(isHonest ? "photo_description_2_honest" : "photo_description_2")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {grid}
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
  );
}
