import { createContext, useContext } from "react";

export const ContainerRefContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export const useContainerRef = () => {
  const context = useContext(ContainerRefContext);
  if (!context)
    throw new Error(
      "useContainerRef must be used within a ContainerRefProvider",
    );
  return context;
};
