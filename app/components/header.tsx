"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguageContext } from "../context/changeLanguage";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { openSidebar, isFloatElement, setIsFloatElement, isHonest, t } =
    useLanguageContext();

  const content = "";

  const navigationItems = [
    { id: "home", label: t("navbar_home"), href: "/" },
    { id: "me", label: t("navbar_me"), href: "/me" },
    { id: "design", label: t("navbar_design"), href: "/design" },
    {
      id: "IllustrationAnimation",
      label: t("navbar_ilustration"),
      href: "/illustration",
    },
    { id: "photo&video", label: t("navbar_photography_video"), href: "/photo" },
    { id: "tatto", label: t("navbar_tattoo"), href: "/tatto" },
    { id: "contact", label: t("navbar_contact"), href: "/contact" },
  ];
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Componente de Header Responsive Reutilizable
  const ResponsiveHeader = () => (
    <div className="fixed w-full top-0 left-0 right-0 z-50">
      <header className="w-full backdrop-brightness-75 lg:backdrop-brightness-75 backdrop-blur-md lg:bg-transparent headerNoise ">
        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3">
          <div className="text-white text-sm font-medium">{t("app_title")}</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col gap-1 p-2 hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle menu"
          >
            <span
              className={`w-5 h-0.5 bg-white transition-transform ${
                isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white transition-opacity ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white transition-transform ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300  opacity-90 ${
            isMobileMenuOpen ? "max-h-98 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-4 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block py-3 px-2 text-sm  rounded transition-colors ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10 text-white"
                    }`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  openSidebar(content, "left");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
              >
                Language
              </button>
            </div>
          </nav>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-between px-4 xl:px-6 py-0">
          <div className="asideLayout_options hover:text-neutral-50 text-neutral-50 transition-all duration-300">
            {t("app_title")}
          </div>
          <nav className="flex space-x-1 xl:space-x-2 justify-center items-center">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`asideLayout_options hover:text-neutral-50 text-neutral-50 px-1 xl:px-8 py-2 transition-all duration-300 text-xs xl:text-base whitespace-nowrap ${
                    isActive ? "optionActiveNoBt" : ""
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span>[ {item.label} ]</span>
                </Link>
              );
            })}
          </nav>
          <span
            onClick={() => openSidebar(content, "left")}
            className="asideLayout_options hover:text-neutral-50 text-neutral-50 cursor-pointer transition-all duration-300"
          >
            Language
          </span>
        </div>
      </header>
    </div>
  );

  function PhotoMainScreen() {
    const [currentFrame, setCurrentFrame] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    // const frames = ["/images/photo/1.webp", "/images/photo/2.webp", "/images/photo/3.webp"];

    // Seleccionar carpeta según el contexto honesto
    const folder = isHonest ? "Honest" : "Profecional";
    const frames = [
      `/images/photo/${folder}/1.webp`,
      `/images/photo/${folder}/2.webp`,
      `/images/photo/${folder}/3.webp`,
    ];

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        // Ajustar el progreso para que llegue al 100% cuando scrollProgress = 75% de sectionHeight
        // Esto hace que la última imagen (frame 3) se muestre cuando llegas al 75% del scroll
        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        // Calcular qué fotograma mostrar basado en el progreso ajustado
        const frameIndex = Math.min(
          Math.floor(normalizedProgress * frames.length),
          frames.length - 1
        );

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesarios
        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Llamada inicial

      return () => window.removeEventListener("scroll", handleScroll);
    }, [currentFrame, frames.length]);

    return (
      <>
        <section
          ref={sectionRef}
          className="MainScreenImgPhoto relative top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            {frames.map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Photo frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }

  function IllustrationMainScreen() {
    const [currentFrame, setCurrentFrame] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    // Seleccionar carpeta según el contexto honesto
    const folder = isHonest ? "Honest" : "Profecional";
    const frames = [
      `/images/illus/${folder}/1.webp`,
      `/images/illus/${folder}/2.webp`,
      `/images/illus/${folder}/3.webp`,
    ];

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        // Ajustar el progreso para que llegue al 100% cuando scrollProgress = 75% de sectionHeight
        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        // Calcular qué fotograma mostrar basado en el progreso ajustado
        const frameIndex = Math.min(
          Math.floor(normalizedProgress * frames.length),
          frames.length - 1
        );

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesarios
        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Llamada inicial

      return () => window.removeEventListener("scroll", handleScroll);
    }, [currentFrame, frames.length]);

    return (
      <>
        <section
          ref={sectionRef}
          className="mainScreenImgIllus relative top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            {frames.map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Illustration frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }
  function DesignMainScreen() {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Desktop frames
    const desktopFrames = [
      "/images/design/1design.webp",
      "/images/design/2design.webp",
      "/images/design/3design.webp",
    ];

    // Mobile frames
    const mobileFrames = [
      "/images/design/1designmobile.webp",
      "/images/design/2designmobile.webp",
      "/images/design/3designmobile.webp",
    ];

    // Detect screen size
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        // Ajustar el progreso para que llegue al 100% cuando scrollProgress = 75% de sectionHeight
        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        // Use the correct frames array based on screen size
        const frames = isMobile ? mobileFrames : desktopFrames;

        // Calcular qué fotograma mostrar basado en el progreso ajustado
        const frameIndex = Math.min(
          Math.floor(normalizedProgress * frames.length),
          frames.length - 1
        );

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesarios
        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Llamada inicial

      return () => window.removeEventListener("scroll", handleScroll);
    }, [currentFrame, desktopFrames.length, mobileFrames.length, isMobile]);

    return (
      <>
        <section
          ref={sectionRef}
          className="mainScreenImgDesign relative top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            {(isMobile ? mobileFrames : desktopFrames).map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Design frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }

  const ComponentMobileHeader = () => {
    return (
      <header className="lg:hidden backdrop-blur-md bg-black/90 border-b border-white/10  headerNoise fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 relative z-10">
            <div className="asideLayout_options text-sm">{t("app_title")}</div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1 p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-opacity ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 bg-black/95 ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="px-4 py-2  ">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block py-3 px-2 text-sm asideLayout_options optionLink rounded transition-colors ${
                        isActive ? "optionActive" : ""
                      }`}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
      </header>
    );
  };

  function HeaderPhoto() {
    return (
      <>
        <PhotoMainScreen />
      </>
    );
  }
  function HeaderMe() {
    return (
      <ResponsiveHeader />
    );
  }
  function HeaderIllustration() {
    return (
      <>
        <IllustrationMainScreen />
      </>
    );
  }
  function HeaderDesign() {
    return (
      <>
        <DesignMainScreen />
      </>
    );
  }
  function TattoMainScreen() {
    const [currentFrame, setCurrentFrame] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    // Seleccionar carpeta según el contexto honesto
    const folder = isHonest ? "honest" : "profesional";
    const frames = [
      `/images/tatto/${folder}/1.webp`,
      `/images/tatto/${folder}/2.webp`,
      `/images/tatto/${folder}/3.webp`,
    ];

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        // Ajustar el progreso para que llegue al 100% cuando scrollProgress = 75% de sectionHeight
        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        // Calcular qué fotograma mostrar basado en el progreso ajustado
        const frameIndex = Math.min(
          Math.floor(normalizedProgress * frames.length),
          frames.length - 1
        );

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesarios
        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Llamada inicial

      return () => window.removeEventListener("scroll", handleScroll);
    }, [currentFrame, frames.length]);

    return (
      <>
        <section
          ref={sectionRef}
          className="mainScreenImgTatto relative top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            {frames.map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Tatto frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }

  function HeaderTatto() {
    return (
      <>
        <TattoMainScreen />
      </>
    );
  }

  function ContactMainScreen() {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Desktop frames
    const desktopFrames = [
      "/images/contact/1.webp",
      "/images/contact/2.webp",
      "/images/contact/3.webp"
    ];

    // Mobile frames
    const mobileFrames = [
      "/images/contact/1Mobile.webp",
      "/images/contact/2Mobile.webp",
      "/images/contact/3Mobile.webp"
    ];

    // Detect screen size
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        // Ajustar el progreso para que llegue al 100% cuando scrollProgress = 75% de sectionHeight
        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        // Use the correct frames array based on screen size
        const frames = isMobile ? mobileFrames : desktopFrames;

        // Calcular qué fotograma mostrar basado en el progreso ajustado
        const frameIndex = Math.min(
          Math.floor(normalizedProgress * frames.length),
          frames.length - 1
        );

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesarios
        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Llamada inicial

      return () => window.removeEventListener("scroll", handleScroll);
    }, [currentFrame, desktopFrames.length, mobileFrames.length, isMobile]);

    return (
      <>
        <section
          ref={sectionRef}
          className="mainScreenImgContact relative top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            {(isMobile ? mobileFrames : desktopFrames).map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Contact frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }

  function HeaderContact() {
    return (
      <>
        <ContactMainScreen />
      </>
    );
  }

  function Home() {
    useEffect(() => {
      setIsFloatElement(true);

      return () => {
        setIsFloatElement(false);
      };
    }, []);
    return (
      <>
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className=""
        > */}
        <div className="absolute z-10 inset-0 w-full h-full bg-black/50 flex justify-center items-center flex-col px-4 py-8">
          <div className="mb-4 md:mb-6 lg:mb-8 xl:mb-10">
            <span className="text-white text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold animate-fade-in-up">
              Wind
            </span>
          </div>
          <nav className="flex justify-center items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 flex-wrap px-4 transition-all duration-300 animate-fade-in-up ">
            {navigationItems
              .filter((item) => item.id !== "home")
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block optionHome p-2 md:p-3 lg:p-4 text-sm md:text-base lg:text-xl whitespace-nowrap
                  }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    [ {item.label} ]
                  </Link>
                );
              })}
          </nav>
          {isHonest && (
            <div className="mt-4 md:mt-6 lg:mt-8 xl:mt-10 animate-fade-in-up">
              <Image
                loading="lazy"
                priority={false}
                className="w-40 h-40 "
                alt="bucket give me a job"
                src={"/images/gaj.png"}
                width={150}
                height={150}
              />
            </div>
          )}
        </div>
        {/* </motion.div> */}
      </>
    );
  }
  return (
    <>
      {pathname === "/photo" && <HeaderPhoto />}
      {pathname === "/me" && <HeaderMe />}
      {pathname === "/illustration" && <HeaderIllustration />}
      {pathname === "/design" && <HeaderDesign />}
      {pathname === "/tatto" && <HeaderTatto />}
      {pathname === "/contact" && <HeaderContact />}
      {pathname === "/" && <Home />}
    </>
  );
}
