// lib/persona.tsx
"use client";
import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

export type Persona = "graduate" | "admin" | null;

const PersonaContext = createContext<{
  persona: Persona;
  setPersona: (p: Persona) => void;
} | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null);

  useEffect(() => {
    const stored = localStorage.getItem("te-persona") as Persona | null;
    if (stored === "graduate" || stored === "admin") {
      setPersonaState(stored);
    }
  }, []);

  const setPersona = useCallback((p: Persona) => {
    if (p) {
      localStorage.setItem("te-persona", p);
    } else {
      localStorage.removeItem("te-persona");
    }
    setPersonaState(p);
  }, []);

  const value = useMemo(() => ({ persona, setPersona }), [persona, setPersona]);

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (ctx === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return ctx;
}
