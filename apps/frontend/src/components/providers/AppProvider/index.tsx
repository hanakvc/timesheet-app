import type { ReactNode } from "react";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import SnackbarProvider from "@/components/providers/SnackbarProvider";

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ReactQueryProvider>
      <SnackbarProvider>{children}</SnackbarProvider>
    </ReactQueryProvider>
  );
};

export default AppProvider;
