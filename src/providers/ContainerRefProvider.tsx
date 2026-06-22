import { ContainerRefContext } from "@/hooks/use-container-ref";
import { useRef } from "react";

export const ContainerRefProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <ContainerRefContext.Provider value={ref}>
      {children}
    </ContainerRefContext.Provider>
  );
};
