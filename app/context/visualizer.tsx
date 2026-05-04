"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CloudinaryResource } from "../types/responseCloudinary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface visualizerContext {
  visualizerImage: (currentImage: CloudinaryResource) => void;
  updateImagesToVisualizer: (images: CloudinaryResource[]) => void;
}

const VisualizerContext = createContext<visualizerContext | undefined>(
  undefined
);

export function VisualizerProvider({ children }: { children: ReactNode }) {
  const [openDialog, SetOpenDialog] = useState<boolean>(false);
  const [imagesView, SetImagesView] = useState<CloudinaryResource[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // API del carrusel (Embla)
  const apiRef = useRef<CarouselApi | null>(null);
  const currentIndexRef = useRef<number | null>(null);

  const setApi = (api: CarouselApi) => {
    apiRef.current = api;
    // Sync hacia React cuando el carrusel cambie
    if (api) {
      api.on("select", () => {
        const idx = api.selectedScrollSnap();
        setCurrentIndex(idx);
        currentIndexRef.current = idx;
      });
    }
  };

  // Mantener el ref sincronizado con el estado
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Solo posicionar el carrusel cuando el diálogo abre, no en cada cambio de índice
  useEffect(() => {
    if (!openDialog || currentIndexRef.current == null) return;

    const scrollToIndex = () => {
      if (apiRef.current && currentIndexRef.current != null) {
        apiRef.current.scrollTo(currentIndexRef.current);
      }
    };

    scrollToIndex();
    const timeoutId = setTimeout(scrollToIndex, 50);

    return () => clearTimeout(timeoutId);
  }, [openDialog]);

  const total = imagesView.length;

  const updateImagesToVisualizer = (images: CloudinaryResource[]) => {
    SetImagesView(images);
  };

  const visualizerImage = useCallback(
    (currentImage: CloudinaryResource) => {
      if (!imagesView.length) return;

      const indexCurrentImage = imagesView.findIndex(
        (img) => img.asset_id === currentImage.asset_id
      );
      const nextIndex = indexCurrentImage >= 0 ? indexCurrentImage : 0;
      setCurrentIndex(nextIndex);
      SetOpenDialog(true);
    },
    [imagesView]
  );
  const next = useCallback(() => {
    if (!apiRef.current) return;
    apiRef.current.scrollNext();
  }, []);

  const prev = useCallback(() => {
    if (!apiRef.current) return;
    apiRef.current.scrollPrev();
  }, []);


  return (
    <VisualizerContext.Provider
      value={{ visualizerImage, updateImagesToVisualizer }}
    >
      <Dialog open={openDialog} modal={true} onOpenChange={SetOpenDialog}>
        <VisuallyHidden>
          <DialogTitle>Title</DialogTitle>
        </VisuallyHidden>
        <DialogContent
          aria-describedby="dialogVisualizerImg"
          showCloseButton={false}
          className="h-screen w-screen max-w-screen overflow-hidden flex items-center justify-center p-0
                     md:h-[90vh] md:w-[90vw] md:max-w-[1400px] md:rounded-lg border-none shadow-none"
        >
          {/* Close button — always visible, top-right */}
          <button
            type="button"
            onClick={() => SetOpenDialog(false)}
            aria-label="Cerrar"
            className="absolute top-3 right-3 z-[60]
              inline-flex items-center justify-center w-10 h-10
              rounded-full bg-black/70 hover:bg-black/90 active:scale-95
              text-white border border-white/20 shadow-lg
              transition-all duration-150 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full overflow-hidden relative">
            <Carousel
              className="w-full"
              opts={{ loop: true, startIndex: currentIndex || 0 }}
              setApi={setApi}
              tabIndex={0}
              autoFocus
            >
              <CarouselContent className="ml-0">
                {imagesView.map((image, index) => (
                  <CarouselItem
                    key={"carousel-" + index}
                    className="pl-0 flex items-center justify-center"
                  >
                    {image.resource_type === "video" ? (
                      <video
                        src={image.secure_url}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-screen md:max-h-[90vh] max-w-full w-auto h-auto"
                      />
                    ) : (
                      <img
                        src={image.secure_url}
                        alt={image.display_name}
                        className="max-h-screen md:max-h-[90vh] max-w-full w-auto h-auto object-contain"
                        loading="lazy"
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* <CarouselPrevious /> */}
              {/* <CarouselNext /> */}
              {/* Flecha Izquierda */}
              {imagesView.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50
                 inline-flex items-center justify-center h-10 w-10
                 rounded-full bg-black/60 hover:bg-black/75
                 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Flecha Derecha */}
              {imagesView.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-50
                 inline-flex items-center justify-center h-10 w-10
                 rounded-full bg-black/60 hover:bg-black/75
                 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </VisualizerContext.Provider>
  );
}

export function useVisualizerContext() {
  const context = useContext(VisualizerContext);
  if (!context)
    throw new Error(
      "visualizaer context must be used within VisualizerProvider"
    );
  return context;
}
