'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={cn("relative", { 'pr-8 sm:pr-20': stepIdx !== steps.length - 1 })}>
            {stepIdx < currentStep ? (
              // Completed Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary"
                >
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </div>
              </>
            ) : stepIdx === currentStep ? (
              // Current Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </div>
              </>
            ) : (
              // Upcoming Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-transparent"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step}</span>
                </div>
              </>
            )}
            <div className="absolute top-10 -ml-4 text-center w-20">
              <p className={cn("text-sm font-medium", stepIdx <= currentStep ? "text-primary" : "text-gray-500")}>{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
