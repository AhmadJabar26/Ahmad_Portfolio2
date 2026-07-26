import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "initial" | "whileInView"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  viewportAmount?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.4, // Fast & snappy 0.4s response
  direction = "up",
  distance = 25,
  className = "",
  viewportAmount = 0.1, // Triggers quickly as soon as 10% enters viewport
  once = true,
  ...props
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...initialPos,
        scale: 0.98,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, amount: viewportAmount, margin: "-20px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple/Award-winning agency ultra-snappy curve
      }}
      style={{ willChange: "transform, opacity" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

