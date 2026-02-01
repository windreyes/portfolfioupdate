"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dict, type Lang } from "@/app/i18n/dictionaries";

interface LanguageContext {
  isSidebarOpen: boolean;
  placement: SidebarPlacement;
  sidebarContent: ReactNode | null;
  openSidebar: (content?: ReactNode, placement?: SidebarPlacement) => void;
  closeSidebar: () => void;
  isFloatElement: boolean;
  setIsFloatElement: (param: boolean) => void;
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (
    key: keyof (typeof dict)["en"],
    params?: Record<string, string | number>
  ) => string;
  isHonest: boolean;
  toggleHonest: () => void;
}
type SidebarPlacement = "right" | "left";

const LanguageContextInstance = createContext<LanguageContext | undefined>(undefined);

const STORAGE_KEY_LANG = "app_lang";
const STORAGE_KEY_HONEST = "app_honest";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFloatElement, setIsFloatElement] = useState(false);
  const [isHonest, setIsHonest] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<ReactNode | null>(null);
  const [placement, setPlacement] = useState<SidebarPlacement>("right");
  const [language, setLanguageState] = useState<Lang>("en");

  // Rehidrata preferencias desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedLang = localStorage.getItem(STORAGE_KEY_LANG) as Lang | null;
    if (storedLang === "en" || storedLang === "es") {
      setLanguageState(storedLang);
    }

    const storedHonest = localStorage.getItem(STORAGE_KEY_HONEST);
    if (storedHonest !== null) {
      setIsHonest(storedHonest === "true");
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(
    (content?: ReactNode, place: SidebarPlacement = "right") => {
      if (content !== undefined) setSidebarContent(content);
      setPlacement(place);
      setIsSidebarOpen(true);
    },
    []
  );

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
      document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    } catch {}
  }, []);

  const toggleHonest = useCallback(() => {
    setIsHonest((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_HONEST, String(newValue));
      } catch {}
      return newValue;
    });
  }, []);

  // Función de traducción con params simples: "Hello {name}"
  const t = useCallback(
    (
      key: keyof (typeof dict)["en"],
      params?: Record<string, string | number>
    ) => {
      const raw = (dict[language][key] ?? String(key)) as string;
      if (!params) return raw;

      return Object.entries(params).reduce<string>(
        (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, "g"), String(v)),
        raw
      );
    },
    [language]
  );

  // Memoiza el value para evitar re-renders innecesarios
  const value = useMemo<LanguageContext>(
    () => ({
      isSidebarOpen,
      placement,
      sidebarContent,
      openSidebar,
      closeSidebar,
      language,
      setLanguage,
      t,
      isFloatElement,
      setIsFloatElement,
      isHonest,
      toggleHonest,
    }),
    [
      isSidebarOpen,
      placement,
      sidebarContent,
      openSidebar,
      closeSidebar,
      language,
      setLanguage,
      t,
      isFloatElement,
      isHonest,
      toggleHonest,
    ]
  );
  return (
    <LanguageContextInstance.Provider value={value}>
      {children}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-40 bg-[#151515]/40 backdrop-blur-[2px]"
            />

            {/* Compact language selector popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
              className="fixed top-24 right-8 z-50 w-[220px]"
            >
              <div className="relative backdrop-blur-[24px] bg-[#151515]/95 border border-[#ebebeb]/10 rounded-lg shadow-2xl overflow-hidden">
                <div className="relative p-5">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ebebeb]/10">
                    <h3 className="text-xs font-medium tracking-widest text-[#ebebeb]/50 uppercase">
                      Language
                    </h3>
                    <button
                      onClick={closeSidebar}
                      className="text-[#ebebeb]/30 hover:text-[#ebebeb]/80 transition-all duration-200 p-1 hover:rotate-90 transform"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Language options */}
                  <div className="space-y-1.5">
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLanguage("en");
                        closeSidebar();
                      }}
                      className={`
                        w-full px-3.5 py-2.5 rounded-md text-left transition-all duration-300 relative overflow-hidden group
                        ${language === "en"
                          ? "bg-[#ebebeb] text-[#151515] shadow-md"
                          : "bg-[#ebebeb]/5 text-[#ebebeb]/60 hover:bg-[#ebebeb]/10 hover:text-[#ebebeb]/90"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium tracking-wide">English</span>
                        {language === "en" && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" fill="#151515" fillOpacity="0.1"/>
                              <path d="M4 7L6.5 9.5L10 5" stroke="#151515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      {language !== "en" && (
                        <div className="absolute inset-0 bg-[#ebebeb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLanguage("es");
                        closeSidebar();
                      }}
                      className={`
                        w-full px-3.5 py-2.5 rounded-md text-left transition-all duration-300 relative overflow-hidden group
                        ${language === "es"
                          ? "bg-[#ebebeb] text-[#151515] shadow-md"
                          : "bg-[#ebebeb]/5 text-[#ebebeb]/60 hover:bg-[#ebebeb]/10 hover:text-[#ebebeb]/90"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium tracking-wide">Español</span>
                        {language === "es" && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" fill="#151515" fillOpacity="0.1"/>
                              <path d="M4 7L6.5 9.5L10 5" stroke="#151515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      {language !== "es" && (
                        <div className="absolute inset-0 bg-[#ebebeb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isFloatElement && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              onClick={toggleHonest}
              className="relative w-[130px] h-[44px] rounded-full border-[2px] backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer group transition-colors duration-300"
              style={{
                borderColor: isHonest ? '#ebebeb' : '#151515',
                backgroundColor: isHonest ? 'rgba(21, 21, 21, 0.9)' : 'rgba(235, 235, 235, 0.9)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Text "HONEST/HONESTO" - positioned to avoid circle */}
              <motion.div
                className="absolute inset-0 flex items-center pointer-events-none"
                animate={{
                  paddingLeft: isHonest ? '12px' : '42px',
                  paddingRight: isHonest ? '42px' : '12px'
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              >
                <span
                  className="text-sm font-light tracking-[0.2em] uppercase select-none transition-colors duration-300"
                  style={{
                    color: isHonest ? '#ebebeb' : '#151515'
                  }}
                >
                  {t("honest")}
                </span>
              </motion.div>

              {/* Sliding circle */}
              <motion.div
                className="absolute top-[3px] h-[36px] w-[36px] rounded-full shadow-lg transition-colors duration-300"
                style={{
                  backgroundColor: isHonest ? '#ebebeb' : '#151515'
                }}
                animate={{
                  left: isHonest ? "calc(100% - 39px)" : "3px"
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.8
                }}
              >
                {/* Inner circle detail */}
                <div
                  className="absolute inset-[5px] rounded-full border transition-colors duration-300"
                  style={{
                    borderColor: isHonest ? 'rgba(21, 21, 21, 0.1)' : 'rgba(235, 235, 235, 0.15)'
                  }}
                />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </LanguageContextInstance.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContextInstance);
  if (!context)
    throw new Error("language context must be used within LanguageProvider");
  return context;
}
