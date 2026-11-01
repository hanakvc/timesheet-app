import { Suspense, type ReactNode } from "react";
import AppProvider from "@/components/providers/AppProvider";
import Sidebar from "@/components/shared/Sidebar";
import { inter } from "@/fonts";
import "@/styles/global.scss";
import styles from "./styles.module.scss";

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppProvider>
          <div className={styles.shell}>
            <div className={styles.sidebar}>
              <Sidebar />
            </div>
            <div className={styles.content}>
              <Suspense>{children}</Suspense>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
