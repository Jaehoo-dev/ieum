import { ReactNode, useState } from "react";

import { Chevron } from "./Chevron";

interface Props {
  type?: "BASIC" | "BLIND";
  defaultOpened?: boolean;
  title: string;
  children: ReactNode;
}

export function AccordionSection({
  type = "BASIC",
  defaultOpened,
  title,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpened ?? false);

  return (
    <div
      className={`flex w-full flex-col rounded-lg border-2 ${
        type === "BLIND" ? "border-blind-500" : "border-primary-500"
      } p-4`}
    >
      <div
        role="button"
        className="flex w-full items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <p className="text-xl font-semibold text-gray-900">{title}</p>
        <Chevron direction={isOpen ? "down" : "up"} />
      </div>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "mt-2 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
