import { useContext } from "react";
import { SnackbarContext } from "@/components/providers/SnackbarProvider";

export default function useSnackbar() {
  return useContext(SnackbarContext);
}
