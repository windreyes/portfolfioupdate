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
    <div className="absolute w-full top-0 left-0 right-0 z-50">
    <header className="w-full backdrop-blur-lg headerNoise ">
      {/* Mobile Menu */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3">
        <div className="text-white text-sm font-medium">{t("app_title")}</div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col gap-1 p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
          <span className={`w-5 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="px-4 py-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`block py-3 px-2 text-sm text-white rounded transition-colors ${isActive ? "bg-white text-black" : "hover:bg-white/10"}`}
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
                className={`asideLayout_options hover:text-neutral-50 text-neutral-50 px-1 xl:px-8 py-2 transition-all duration-300 text-xs xl:text-base whitespace-nowrap ${isActive ? "optionActiveNoBt" : ""}`}
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
    const sectionRef = useRef<HTMLElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastScrollY = useRef<number>(-1);
    const durationRef = useRef<number>(0);

    useEffect(() => {
      const video = videoRef.current!;
      const section = sectionRef.current!;
      let start = 0;
      let end = 0;

      const calcBounds = () => {
        const rect = section.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset;
        // Inicio y fin del tramo donde el video progresa
        start = scrollTop + rect.top; // comienzo de la sección
        end = start + section.offsetHeight - window.innerHeight; // fin “visible”
        if (end <= start) end = start + 1; // evita división por cero
      };

      const onMeta = () => {
        durationRef.current = video.duration || 0;
      };

      const tick = () => {
        const y = window.scrollY || window.pageYOffset;
        if (y !== lastScrollY.current) {
          lastScrollY.current = y;
          // progreso del 0 al 1 según el tramo [start, end]
          const progress = Math.min(
            1,
            Math.max(0, (y - start) / (end - start))
          );
          // mapea progreso a tiempo del video
          if (durationRef.current > 0) {
            video.currentTime = progress * durationRef.current;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      // Configuración
      video.addEventListener("loadedmetadata", onMeta, { passive: true });
      calcBounds();
      onMeta();
      rafRef.current = requestAnimationFrame(tick);
      window.addEventListener("resize", calcBounds, { passive: true });

      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", calcBounds);
      };
    }, []);

    return (
      <>
        <section
          ref={sectionRef}
          className="MainScreenImg relative  top-0 left-0 right-0 z-50 w-full"
        >
          <div className="MainScreenImg_div">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
              src={"/videos/MeCover.mp4"}
            ></video>
          </div>
          <div className="absolute w-full top-0 left-0 right-0 z-50">
            <ResponsiveHeader />
          </div>
        </section>
      </>
    );
  }
 
  function IllustrationMainScreen() {
    return (
      <>
        <section className="MainScreenImgMe">
          <div className="MainScreenImgMe_div">
            <Image
              loading="lazy"
              priority={false}
              className="MainScreenImgMe_div_Img"
              alt="Picture of the wind"
              src={"/images/mainIllustration.png"}
              fill
              sizes="100vw"
            />
          </div>
        </section>
      </>
    );
  }
  function DesignMainScreen() {
    return (
      <>
        <section className="MainScreenImgMe">
          <div className="MainScreenImgMe_div">
            <Image
              loading="lazy"
              priority={false}
              className="MainScreenImgMe_div_Img"
              alt="Picture of the wind"
              src={"/images/designIllustration.png"}
              fill
              sizes="100vw"
            />
          </div>
        </section>
      </>
    );
  }

  const ComponentMobileHeader = () => {
    return (
      <>
        <header className="lg:hidden backdrop-blur-md bg-white/10 border-b border-white/10  headerNoise relative">
          <div className="flex items-center justify-between px-4 py-3 relative z-10">
            <div className="asideLayout_options text-sm">{t("app_title")}</div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1 p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""
                  }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
              ></span>
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                      className={`block py-3 px-2 text-sm asideLayout_options optionLink rounded transition-colors ${isActive ? "optionActive" : ""
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
      </>
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
      <>
        <ResponsiveHeader />
      </>
    );
  }
  function HeaderIllustration() {
    return (
      <>
        <ResponsiveHeader />
        <IllustrationMainScreen />
      </>
    );
  }
  function HeaderDesign() {
    return (
      <>
        <ResponsiveHeader />
        <DesignMainScreen />
      </>
    );
  }
  function HeaderTatto() {
    return (
      <>
        <ResponsiveHeader />
      </>
    );
  }

  function HeaderContact() {
    return (
      <>
        <ResponsiveHeader />
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
