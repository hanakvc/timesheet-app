export interface SnackbarMessage {
  title: string;
  details?: string[];
  tone?: "success" | "error";
}
