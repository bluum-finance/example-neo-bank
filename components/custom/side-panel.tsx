'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  /** Optional title rendered in the built-in header */
  title?: React.ReactNode;
}

interface SidePanelContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SidePanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface SidePanelTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface SidePanelDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SidePanel
 *
 * A slide-in panel that covers the **right half** of the screen at full height.
 * Rendered as a fixed overlay — clicking the backdrop closes the panel.
 */
export function SidePanel({ open, onOpenChange, children, className, showCloseButton = true }: SidePanelProps) {
  // Lock body scroll while panel is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // Position: right half, full height
          'fixed top-0 right-0 z-50 h-full w-1/2',
          // Background & shadow
          'bg-background shadow-2xl',
          // Slide animation
          'transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
          // Allow internal scrolling
          'flex flex-col overflow-hidden',
          className
        )}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 shrink-0"
            onClick={() => onOpenChange(false)}
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export function SidePanelContent({ children, className }: SidePanelContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function SidePanelHeader({ children, className }: SidePanelHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5 text-left', className)}>{children}</div>;
}

export function SidePanelTitle({ children, className, ...props }: SidePanelTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h2>
  );
}

export function SidePanelDescription({ children, className }: SidePanelDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}
