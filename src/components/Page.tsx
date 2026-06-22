import { useEffect, useRef } from "react";
import { useContainerRef } from "@/hooks/use-container-ref";
import { ContainerRefProvider } from "@/providers/ContainerRefProvider";

function Providers(props: { children: React.ReactNode }) {
  const containerRef = useContainerRef();

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      containerRef.current = container.current;
    }
  }, [container, containerRef]);

  return (
    <div className="care-excalidraw-container" ref={container}>
      {props.children}
    </div>
  );
}

export default function Page(props: { children: React.ReactNode }) {
  return (
    <ContainerRefProvider>
      <Providers>{props.children}</Providers>
    </ContainerRefProvider>
  );
}
