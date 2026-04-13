// lib/persona.tsx
"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Persona = "graduate" | "admin" | null;

const PersonaContext = createContext<{
  persona: Persona;
  setPersona: (p: Persona) => void;
}>({ persona: null, setPersona: () => {} });

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null);

  useEffect(() => {
    const stored = localStorage.getItem("te-persona") as Persona | null;
    if (stored === "graduate" || stored === "admin") {
      setPersonaState(stored);
    }
  }, []);

  function setPersona(p: Persona) {
    if (p) {
      localStorage.setItem("te-persona", p);
    } else {
      localStorage.removeItem("te-persona");
    }
    setPersonaState(p);
  }

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
