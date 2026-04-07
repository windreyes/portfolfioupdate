"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguageContext } from "../context/changeLanguage";
import { motion, AnimatePresence } from "framer-motion";

// Custom scroll-to-frame mapping.
// First transition is fast (at 12% of scroll), the rest spread over the remaining range.
// Thresholds for 3 frames: [0→1 at 12%, 1→2 at 52%]
function getFrameIndex(progress: number, count: number): number {
  if (count === 3) {
    if (progress >= 0.52) return 2;
    if (progress >= 0.12) return 1;
    return 0;
  }
  return Math.min(Math.floor(progress * count), count - 1);
}

export default function Header() {
  const { openSidebar, isFloatElement, setIsFloatElement, isHonest, toggleHonest, t } =
    useLanguageContext();

  const content = "";

  const navigationItems = [
    // { id: "home", label: t("navbar_home"), href: "/" },
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
  const logoSrc = pathname === "/contact" || pathname === "/design" || pathname === "/illustration" || pathname === "/photo" ? "/images/LOGO/Logo-02.webp" : "/images/LOGO/Logo-01.webp";

  const ResponsiveHeader = () => (
    <div className="fixed w-full top-0 left-0 right-0 z-50">
      <header className="w-full backdrop-brightness-75 lg:backdrop-brightness-75 backdrop-blur-md lg:bg-transparent headerNoise ">
        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3">
          <Link href="/"><Image src={logoSrc} alt="Wind" width={100} height={40} /></Link>
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
              <div className="border-t border-white/20 mt-2 pt-2">
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
            </div>
          </nav>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-between px-4 xl:px-6 py-0">
          <Link href="/" className="asideLayout_options hover:text-neutral-50 text-neutral-50 transition-all duration-300">
            <Image src={logoSrc} alt="Wind" width={120} height={48} />
          </Link>
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
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const folder = isHonest ? "Honest" : "Profecional";
    const desktopFrames = [
      `/images/photo/${folder}/1.webp`,
      `/images/photo/${folder}/2.webp`,
      `/images/photo/${folder}/3.webp`,
    ];
    const mobileFrames = isHonest
      ? [
          `/images/photo/${folder}/1Responsive.webp`,
          `/images/photo/${folder}/2Responsive.webp`,
          `/images/photo/${folder}/3Responsive.webp`,
        ]
      : desktopFrames;

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const frames = isMobile ? mobileFrames : desktopFrames;

    // objectPosition: desktop [X% Y%] / mobile [X% Y%]
    const desktopPositions = isHonest ? ["50% 50%", "50% 50%", "75% 100%"] : ["50% 50%", "50% 50%", "50% 50%"];
    const mobilePositions  = isHonest ? ["50% 50%", "50% 50%", "70% 78%"]  : ["50% 50%", "50% 50%", "50% 50%"];
    const objectPositions  = isMobile ? mobilePositions : desktopPositions;

    useEffect(() => {
      const handleScroll = () => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollProgress = -rect.top;

        const adjustedProgress = scrollProgress / (sectionHeight * 0.75);
        const normalizedProgress = Math.min(Math.max(adjustedProgress, 0), 1);

        const frameIndex = getFrameIndex(normalizedProgress, frames.length);

        if (frameIndex >= 0 && frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();

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
                style={{ objectPosition: objectPositions[index] }}
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
        const frameIndex = getFrameIndex(normalizedProgress, frames.length);

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
    const desktopFrames = isHonest
      ? [
          "/images/design/1design.webp",
          "/images/design/2design.webp",
          "/images/design/3design.webp",
        ]
      : [
          "/images/design/1DesingProfessional.webp",
          "/images/design/2DesingProfessional.webp",
          "/images/design/3DesingProfessional.webp",
        ];

    // Mobile frames
    const mobileFrames = isHonest
      ? [
          "/images/design/1designmobile.webp",
          "/images/design/2designmobile.webp",
          "/images/design/3designmobile.webp",
        ]
      : [
          "/images/design/1DesingProfessional.webp",
          "/images/design/2DesingProfessional.webp",
          "/images/design/3DesingProfessional.webp",
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
        const frameIndex = getFrameIndex(normalizedProgress, frames.length);

        // Solo actualizar si cambia el fotograma para evitar re-renders innecesario
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
            <Image src="/images/LOGO/Logo-01.webp" alt="Wind" width={100} height={40} />
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
        const frameIndex = getFrameIndex(normalizedProgress, frames.length);

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

    const desktopFrames = [
      "/images/contact/1.webp",
      "/images/contact/2.webp",
      "/images/contact/3.webp",
    ];

    const mobileFrames = [
      "/images/contact/1Contact Mobile.webp",
      "/images/contact/2ContactMobile.webp",
      "/images/contact/3ContactMobile.webp",
    ];

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Time-based loop (GIF-style)
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    const frames = isMobile ? mobileFrames : desktopFrames;

    return (
      <>
        <section className="mainScreenImgContact relative top-0 left-0 right-0 z-50 w-full">
          <div className="MainScreenImg_div">
            {frames.map((src, index) => (
              <Image
                key={src}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className={`h-full w-full object-cover transition-opacity duration-1000 ${
                  currentFrame === index ? "opacity-100" : "opacity-0"
                }`}
                alt={`Contact frame ${index + 1}`}
                src={src}
                fill
                sizes="100vw"
              />
            ))}
          </div>

          {/* Contact info overlay — desktop */}
          <div className="hidden md:flex absolute inset-0 z-10 items-center" style={{ paddingLeft: "52%" }}>
            <div className="space-y-6">
              <p className="text-sm tracking-[0.35em] text-white font-light">
                {t("contact_title").toUpperCase()}
              </p>
              <div className="space-y-4">
                <div className="flex gap-8">
                  <span className="text-sm text-gray-400 w-24 font-light">{t("contact_instagram")}</span>
                  <span className="text-sm text-white font-light">Wind_Reyes</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-sm text-gray-400 w-24 font-light">{t("contact_telephone")}</span>
                  <span className="text-sm text-white font-light">0406 170 807</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-sm text-gray-400 w-24 font-light">{t("contact_email")}</span>
                  <span className="text-sm text-white font-light">windreyesc@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info overlay — mobile */}
          <div className="md:hidden absolute inset-0 z-10 flex flex-col justify-end">
            <div
              className="px-6 pb-16 pt-10 space-y-5 flex flex-col items-center"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            >
              <p className="text-xs tracking-[0.4em] text-gray-300 font-light">{t("contact_title").toUpperCase()}</p>
              <div className="space-y-3 flex flex-col items-center">
                <div className="flex gap-6">
                  <span className="text-xs text-gray-400 w-20 font-light">{t("contact_instagram")}</span>
                  <span className="text-xs text-white font-light">Wind_Reyes</span>
                </div>
                <div className="flex gap-6">
                  <span className="text-xs text-gray-400 w-20 font-light">{t("contact_telephone")}</span>
                  <span className="text-xs text-white font-light">0406 170 807</span>
                </div>
                <div className="flex gap-6">
                  <span className="text-xs text-gray-400 w-20 font-light">{t("contact_email")}</span>
                  <span className="text-xs text-white font-light">windreyesc@gmail.com</span>
                </div>
              </div>
            </div>
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
    return (
      <>
        <div className="absolute z-10 inset-0 w-full h-full bg-black/50 flex justify-center items-center flex-col px-4 py-8">
          <div className="mb-4 md:mb-6 lg:mb-8 xl:mb-10">
            <Image
              src="/images/LOGO/Logo-02.webp"
              alt="Wind"
              width={300}
              height={120}
              className="animate-fade-in-up"
            />
          </div>
          <nav className="flex justify-center items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 flex-wrap px-4 transition-all duration-300 animate-fade-in-up ">
            {navigationItems
              .filter((item) => item.id !== "home")
              .map((item) => {
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
       
          {/* Honest switch + Language button — solo en home, centrado */}
          <div className="mt-6 flex flex-row items-center gap-4 lg:gap-20 animate-fade-in-up">
            <motion.button
              onClick={toggleHonest}
              className="relative w-[100px] h-[36px] md:w-[130px] md:h-[44px] rounded-full border-[1.5px] md:border-[2px] backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer"
              style={{
                borderColor: isHonest ? '#ebebeb' : '#151515',
                backgroundColor: isHonest ? 'rgba(21, 21, 21, 0.9)' : 'rgba(235, 235, 235, 0.9)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 flex items-center pointer-events-none"
                animate={{
                  paddingLeft: isHonest ? '10px' : '34px',
                  paddingRight: isHonest ? '34px' : '10px'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <span
                  className="text-[10px] md:text-sm font-light tracking-[0.15em] md:tracking-[0.2em] uppercase select-none transition-colors duration-300"
                  style={{ color: isHonest ? '#ebebeb' : '#151515' }}
                >
                  {t("honest")}
                </span>
              </motion.div>
              <motion.div
                className="absolute top-[2px] md:top-[3px] h-[30px] w-[30px] md:h-[36px] md:w-[36px] rounded-full shadow-lg transition-colors duration-300"
                style={{ backgroundColor: isHonest ? '#ebebeb' : '#151515' }}
                animate={{ left: isHonest ? "calc(100% - 32px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
              >
                <div
                  className="absolute inset-[4px] md:inset-[5px] rounded-full border transition-colors duration-300"
                  style={{ borderColor: isHonest ? 'rgba(21, 21, 21, 0.1)' : 'rgba(235, 235, 235, 0.15)' }}
                />
              </motion.div>
            </motion.button>
            <button
              onClick={() => openSidebar("", "left")}
              className="text-xs text-white/70 hover:text-white tracking-widest uppercase transition-colors duration-200"
            >
              {t("navbar_language")}
            </button>
          </div>
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
