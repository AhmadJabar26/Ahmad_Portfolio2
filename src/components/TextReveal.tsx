import React from "react";
import { motion } from "motion/react";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  mode?: "words" | "lines";
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.025, // Fast 25ms stagger between words for high-end snappy agency feel
  as = "p",
  mode = "words",
}) => {
  const Component = motion[as] as any;

  if (mode === "words") {
    const words = text.split(" ");

    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    };

    const wordVariants = {
      hidden: {
        opacity: 0,
        y: 12,
        filter: "blur(6px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          duration: 0.32,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    return (
      <Component
        className={`inline-flex flex-wrap ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariants}
            className="inline-block mr-[0.25em] whitespace-nowrap"
            style={{ willChange: "transform, opacity, filter" }}
          >
            {word}
          </motion.span>
        ))}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {text}
    </Component>
  );
};
