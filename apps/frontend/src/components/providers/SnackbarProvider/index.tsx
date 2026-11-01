"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import Snackbar from "@/components/shared/Snackbar";
import { SNACKBAR_DURATION_MS } from "@/constants/global";
import type { SnackbarMessage } from "@/interfaces/snackbar";

export const SnackbarContext = createContext<
  (message: SnackbarMessage) => void
>(() => {});

const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), SNACKBAR_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <SnackbarContext.Provider value={setCurrent}>
      {children}
      <Snackbar message={current} onClose={() => setCurrent(null)} />
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
