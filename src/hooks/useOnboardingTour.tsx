import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface TourStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  action?: string;
  nextLabel?: string;
  backLabel?: string;
}

interface UseOnboardingTourOptions {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
  delay?: number;
}

const TOUR_STORAGE_KEY = 'lovable_completed_tours';

export function useOnboardingTour({
  tourId,
  steps,
  onComplete,
  autoStart = true,
  delay = 500,
}: UseOnboardingTourOptions) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Get completed tours from localStorage
  const getCompletedTours = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Mark tour as completed
  const markTourComplete = useCallback(() => {
    try {
      const completed = getCompletedTours();
      if (!completed.includes(tourId)) {
        completed.push(tourId);
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
      }
    } catch {
      // Ignore storage errors
    }
  }, [tourId, getCompletedTours]);

  // Check if tour has been completed
  const isTourCompleted = useCallback(() => {
    return getCompletedTours().includes(tourId);
  }, [tourId, getCompletedTours]);

  // Reset tour (for testing)
  const resetTour = useCallback(() => {
    try {
      const completed = getCompletedTours().filter(id => id !== tourId);
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
      setCurrentStepIndex(0);
      setIsActive(false);
      setIsReady(false);
    } catch {
      // Ignore storage errors
    }
  }, [tourId, getCompletedTours]);

  // Start the tour
  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  // End the tour
  const endTour = useCallback((completed = true) => {
    setIsActive(false);
    setCurrentStepIndex(0);
    if (completed) {
      markTourComplete();
      onComplete?.();
    }
  }, [markTourComplete, onComplete]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (isLastStep) {
      endTour(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, endTour]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  // Go to specific step
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  // Skip the tour
  const skipTour = useCallback(() => {
    endTour(true); // Mark as complete when skipping
  }, [endTour]);

  // Auto-start logic
  useEffect(() => {
    if (!autoStart || !user) return;

    const timer = setTimeout(() => {
      setIsReady(true);
      if (!isTourCompleted()) {
        startTour();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, user, delay, isTourCompleted, startTour]);

  return {
    isActive,
    isReady,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    progress,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    resetTour,
    isTourCompleted: isTourCompleted(),
  };
}
