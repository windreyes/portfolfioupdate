"use client"
import Image from "next/image";
import { useEffect } from "react";
import { useLanguageContext } from "../context/changeLanguage";

export default function Me() {
  const { t, isHonest, setIsFloatElement } = useLanguageContext();

  useEffect(() => {
    setIsFloatElement(true);
    return () => setIsFloatElement(false);
  }, [setIsFloatElement]);

  const hobbiesNormal = [
    { id: 1, image: "/images/Chamba.png", alt: "Hobby 1" },
    { id: 2, image: "/images/Literatura.png", alt: "Hobby 2" },
    { id: 3, image: "/images/Animales.png", alt: "Hobby 3" },
    { id: 4, image: "/images/comunidad.png", alt: "Hobby 4" },
  ];

  const hobbiesHonest = [
    { id: 1, image: "/images/symbols/coffee.webp", alt: "Coffee" },
    { id: 3, image: "/images/symbols/exercise.webp", alt: "Exercise" },
    { id: 6, image: "/images/symbols/sports.webp", alt: "Sports" },
    { id: 2, image: "/images/symbols/design.webp", alt: "Design" },
    { id: 4, image: "/images/symbols/Outside.webp", alt: "Outside" },
    { id: 5, image: "/images/symbols/photovideo.webp", alt: "Photo & Video" },
  ];

  const hobbies = isHonest ? hobbiesHonest : hobbiesNormal;

  return (
    <section className="min-h-screen relative w-full overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          loading="lazy"
          priority={false}
          className="h-full w-full object-cover object-center"
          alt="Picture of the wind"
          src={"/images/mew.webp"}
          fill
          sizes="100vw"
        />
      </div>

      {/* Contenido sobre la imagen */}
      <div className="relative z-10 text-white min-h-screen flex items-center">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-center min-h-screen">
            {/* Columna Izquierda - Título */}
            <div className="absolute top-[10%] md:relative flex items-center justify-start md:justify-center lg:justify-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-title font-light italic text-black-main/70 drop-shadow-lg">
                Wind
              </h1>
            </div>

            {/* Columna del Medio - Espacio vacío para la foto */}
            <div className="lg:block">
              {/* Este espacio queda vacío para que se vea la foto de fondo */}
            </div>

            {/* Columna Derecha - Contenido */}
            <div className="absolute bottom-0 left-0 space-y-6 md:space-y-8 flex flex-col justify-center sm:absolute sm:left-0 sm:right-0 sm:bottom-0 md:relative sm:w-full md:w-auto lg:w-full bg-black-main/70 sm:bg-black-main/70 md:bg-transparent p-4 sm:p-6 md:p-8 rounded-t-lg sm:rounded-lg">
              {/* Descripción Principal */}
              <div className="space-y-4">
                <p className="text-sm sm:text-white-main lg:text-base xl:text-lg leading-relaxed md:text-black-main drop-shadow-lg font-body font-normal ">
                  {t(isHonest ? "me_description_honest" : "me_description")}
                </p>
                <p className="text-sm  sm:text-white-main lg:text-base xl:text-lg leading-relaxed md:text-black-main drop-shadow-lg font-body font-normal">
                  {t(isHonest ? "me_description_2_honest" : "me_description_2")}
                </p>
              </div>

              {/* Sección de Hobbies */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-white-main md:text-3xl font-title font-light  md:text-black-main drop-shadow-lg">
                  {t("me_hobbies")}
                </h2>

                {/* Grid de Hobbies */}
                <div className="flex flex-wrap gap-4 items-center">
                  {hobbies.map((hobby) => (
                    <div
                      key={hobby.id}
                      className={isHonest ? "" : "relative group"}
                    >
                      {/* Imagen */}
                      <div className={isHonest ? "w-16 h-16 relative" : "circleMe overflow-hidden relative"}>
                        <Image
                          src={hobby.image}
                          alt={hobby.alt}
                          fill
                          className={isHonest ? "object-contain" : "object-cover transition-transform duration-300 group-hover:scale-110"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
