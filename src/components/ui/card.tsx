import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Heart } from "lucide-react";

const cardVariants = cva(
  "relative grid h-full w-full transform-gpu overflow-hidden rounded-[2rem] border border-white/5 shadow-sm transition-all duration-300 ease-in-out group",
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface DestinationCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** The URL for the background image of the card. */
  imageUrl: string;
  /** The category or region text displayed above the main title. */
  category: string;
  /** The main title of the destination. */
  title: string;
  /** A callback function to be invoked when the like button is clicked. */
  onLike: () => void;
  /** Determines if the destination is marked as liked. */
  isLiked?: boolean;
}

const DestinationCard = React.forwardRef<
  HTMLDivElement,
  DestinationCardProps
>(
  (
    {
      className,
      imageUrl,
      category,
      title,
      onLike,
      isLiked = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ className }))}
        {...props}
      >
        {/* Background Image with Hover Animation */}
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = `https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800`;
          }}
          referrerPolicy="no-referrer"
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-all duration-300 group-hover:via-black/50" />

        {/* Like Button */}
        <button
          aria-label={isLiked ? "Unlike destination" : "Like destination"}
          onClick={(e) => {
            e.preventDefault(); // Prevent card click events if any
            e.stopPropagation();
            onLike();
          }}
          className={cn(
            "absolute top-5 right-5 z-20 rounded-full bg-white/10 p-2.5 backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-90 border border-white/10 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 text-white transition-all duration-300",
              isLiked && "fill-red-500 text-red-500 scale-110"
            )}
          />
        </button>

        {/* Text Content with Hover Animation */}
        <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
            - {category} -
          </p>
          <h3 className="mt-2 font-headline text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
            {title}
          </h3>
          {children}
        </div>
      </div>
    );
  }
);
DestinationCard.displayName = "DestinationCard";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { DestinationCard, Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
