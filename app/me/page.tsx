"use client"
import Image from "next/image";
import { useLanguageContext } from "../context/changeLanguage";

export default function Me() {
  const { t } = useLanguageContext();

  const hobbies = [
    { id: 1, image: "/images/Chamba.png", alt: "Hobby 1" },
    { id: 2, image: "/images/Literatura.png", alt: "Hobby 2" },
    { id: 3, image: "/images/Animales.png", alt: "Hobby 3" },
    { id: 4, image: "/images/Comunidad.png", alt: "Hobby 4" },
  ];

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
            <div className="flex items-center justify-start md:justify-center lg:justify-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-title font-light italic text-black-main drop-shadow-lg">
                Wind
              </h1>
            </div>

            {/* Columna del Medio - Espacio vacío para la foto */}
            <div className="lg:block">
              {/* Este espacio queda vacío para que se vea la foto de fondo */}
            </div>

            {/* Columna Derecha - Contenido */}
            <div className="space-y-6 md:space-y-8 flex flex-col justify-center sm:absolute sm:left-0 sm:right-0 sm:bottom-0 md:relative sm:w-full md:w-auto lg:w-full bg-black-main/70 sm:bg-black-main/70 md:bg-transparent p-4 sm:p-6 md:p-8 rounded-t-lg sm:rounded-lg">
              {/* Descripción Principal */}
              <div className="space-y-4">
                <p className="text-sm sm:text-white-main lg:text-base xl:text-lg leading-relaxed md:text-black-main drop-shadow-lg font-body font-normal ">
                  {t("me_description")}
                </p>
                <p className="text-sm  sm:text-white-main lg:text-base xl:text-lg leading-relaxed md:text-black-main drop-shadow-lg font-body font-normal">
                  {t("me_description_2")}
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
                      className="relative group"
                    >
                      {/* Círculo con imagen */}
                      <div className="circleMe overflow-hidden relative">
                        <Image
                          src={hobby.image}
                          alt={hobby.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>

                      {/* Indicador naranja - decorativo */}
                      {/* <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md"></div> */}
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
