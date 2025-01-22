import type { ReactNode } from "react";
import { useState } from "react";

import type { Theme } from "../types";
import { Chevron } from "./Chevron";

interface Props {
  defaultOpened?: boolean;
  title: string;
  children: ReactNode;
  theme?: Theme;
}

export function AccordionSection({
  theme = "BASIC",
  defaultOpened,
  title,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpened ?? false);

  return (
    <div
      className={`flex w-full flex-col rounded-lg border-2 ${
        theme === "BLIND" ? "border-blind-500" : "border-primary-500"
      } p-4`}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
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
