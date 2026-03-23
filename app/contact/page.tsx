"use client"

import { useEffect } from "react";
import { useLanguageContext } from "../context/changeLanguage";

export default function Contact() {
  const { setIsFloatElement } = useLanguageContext();

  useEffect(() => {
    setIsFloatElement(true);
    return () => setIsFloatElement(false);
  }, [setIsFloatElement]);

  return null;
}
