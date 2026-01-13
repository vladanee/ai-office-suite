import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Lightbulb, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TourStep } from '@/hooks/useOnboardingTour';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  isActive: boolean;
  currentStep: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  progress,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: OnboardingTourProps) {
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.target);
      
      if (!targetElement) {
        // If no target found, center the tooltip
        setSpotlightRect(null);
        setTooltipPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
          arrowPosition: 'top',
        });
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const padding = currentStep.spotlightPadding || 8;
      
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 360;
      const tooltipHeight = 220;
      const margin = 16;

      const position = currentStep.position || 'bottom';
      let top = 0;
      let left = 0;
      let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

      switch (position) {
        case 'bottom':
          top = rect.bottom + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'top';
          break;
        case 'top':
          top = rect.top - tooltipHeight - margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'bottom';
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - margin;
          arrowPosition = 'right';
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + margin;
          arrowPosition = 'left';
          break;
      }

      // Clamp to viewport
      left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));

      setTooltipPosition({ top, left, arrowPosition });

      // Scroll element into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  const stepIcons = [Sparkles, Target, Lightbulb];
  const StepIcon = stepIcons[currentStepIndex % stepIcons.length];

  return (
    <AnimatePresence>
      {/* Backdrop with spotlight cutout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        style={{
          background: spotlightRect
            ? `radial-gradient(ellipse at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height) / 1.5}px, rgba(0,0,0,0.85) ${Math.max(spotlightRect.width, spotlightRect.height)}px)`
            : 'rgba(0,0,0,0.85)',
        }}
        onClick={onClose}
      />

      {/* Spotlight border highlight */}
      {spotlightRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-[9999] pointer-events-none rounded-lg"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: '0 0 0 2px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      {tooltipPosition && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[10000] w-[360px]"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-3 h-3 bg-card border-border rotate-45",
              tooltipPosition.arrowPosition === 'top' && "top-[-6px] left-1/2 -translate-x-1/2 border-l border-t",
              tooltipPosition.arrowPosition === 'bottom' && "bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b",
              tooltipPosition.arrowPosition === 'left' && "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b",
              tooltipPosition.arrowPosition === 'right' && "right-[-6px] top-1/2 -translate-y-1/2 border-r border-t"
            )}
          />

          {/* Card */}
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <StepIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-1" />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.content}
              </p>
              
              {currentStep.action && (
                <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary font-medium">
                    💡 {currentStep.action}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-secondary/20 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip tour
              </Button>
              
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrev}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {currentStep.backLabel || 'Back'}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={onNext}
                  className="gradient-primary text-primary-foreground"
                >
                  {currentStep.nextLabel || (isLastStep ? 'Get Started' : 'Next')}
                  {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
