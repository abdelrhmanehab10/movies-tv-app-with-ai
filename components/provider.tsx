import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ModalProvider from "./providers/ModalProvider";
import { Toaster } from "sonner";

interface QueryProviderProps {
  children: React.ReactNode;
}
const queryClient = new QueryClient();

const Provider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
};

export default Provider;
