"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
  isVisible?: boolean;
  highlightText?: string;
  highlightClassName?: string;
}

function GradualSpacing({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
  isVisible = true,
  highlightText,
  highlightClassName,
}: GradualSpacingProps) {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {isVisible && (
          <>
            <div className="flex justify-center flex-wrap items-baseline">
              {text.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={framerProps}
                  transition={{ duration, delay: i * delayMultiple }}
                  className={cn("inline-block", className)}
                  style={{ lineHeight: 1.3 }}
                >
                  {char === " " ? <span>&nbsp;</span> : char}
                </motion.span>
              ))}
            </div>
            {highlightText && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={framerProps}
                transition={{ duration, delay: (text.length + 1) * delayMultiple }}
                className={cn("whitespace-nowrap", highlightClassName)}
                style={{ lineHeight: 1.3 }}
              >
                {highlightText}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export { GradualSpacing };
