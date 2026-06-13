import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn("text-2xl font-semibold text-foreground", className)}>
    {children}
  </h1>
);

export const SectionTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cn("text-lg font-semibold text-foreground", className)}>
    {children}
  </h2>
);

export const CardTitle = ({ children, className }: TypographyProps) => (
  <h3 className={cn("text-base font-semibold text-foreground", className)}>
    {children}
  </h3>
);

export const BodyText = ({ children, className }: TypographyProps) => (
  <p className={cn("text-sm leading-relaxed text-foreground", className)}>
    {children}
  </p>
);

export const Caption = ({ children, className }: TypographyProps) => (
  <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
);

export const Mono = ({ children, className }: TypographyProps) => (
  <span className={cn("font-mono text-sm", className)}>{children}</span>
);
