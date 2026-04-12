// app/assessment/page.tsx
"use client";

import { useState } from "react";
import {
  dimensionConfigs,
  dimensionOrder,
  defaultRegistration,
  type RegistrationData,
  type Dimension,
} from "@/lib/data/assessment";
import { buildDefaultAnswers, scoreAll } from "@/lib/scoring";
import { AssessmentShell } from "@/components/assessment/AssessmentShell";
import { RegistrationStep } from "@/components/assessment/RegistrationStep";
import { DimensionStep } from "@/components/assessment/DimensionStep";
import { ResultsScreen } from "@/components/assessment/ResultsScreen";
import { ThankYouScreen } from "@/components/assessment/ThankYouScreen";
import { type PotentialDimensions, dimensionLabels } from "@/lib/data/candidates";

type Step =
  | { kind: "registration" }
  | { kind: "dimension"; index: number }   // index 0–4
  | { kind: "results" }
  | { kind: "thankyou" };

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>({ kind: "registration" });
  const [registration, setRegistration] = useState<RegistrationData>(defaultRegistration);
  const [answers, setAnswers] = useState<Record<Dimension, (string | number | null)[]>>(
    () => buildDefaultAnswers(dimensionConfigs)
  );
  const [results, setResults] = useState<{
    dimensions: PotentialDimensions;
    potentialScore: number;
  } | null>(null);

  function handleRegistrationNext(data: RegistrationData) {
    setRegistration(data);
    setStep({ kind: "dimension", index: 0 });
  }

  function handleDimensionNext(dimension: Dimension, sectionAnswers: (string | number | null)[]) {
    setAnswers((prev) => ({ ...prev, [dimension]: sectionAnswers }));
    const currentIndex = dimensionOrder.indexOf(dimension);
    if (currentIndex < dimensionOrder.length - 1) {
      setStep({ kind: "dimension", index: currentIndex + 1 });
    } else {
      // All dimensions done — compute scores
      const updatedAnswers = { ...answers, [dimension]: sectionAnswers };
      const scored = scoreAll(dimensionConfigs, updatedAnswers);
      setResults(scored);
      setStep({ kind: "results" });
    }
  }

  function handleResultsNext() {
    setStep({ kind: "thankyou" });
  }

  // Determine shell props
  const totalSteps = 7; // registration(0) + 5 dimensions + results(6); thankyou(7) is beyond the bar
  let currentStep = 0;
  let stepLabel = "";

  if (step.kind === "dimension") {
    currentStep = step.index + 1;
    stepLabel = dimensionLabels[dimensionOrder[step.index]];
  } else if (step.kind === "results") {
    currentStep = 6;
    stepLabel = "Your Results";
  } else if (step.kind === "thankyou") {
    currentStep = 7;
    stepLabel = "";
  }

  return (
    <AssessmentShell currentStep={currentStep} totalSteps={totalSteps} stepLabel={stepLabel}>
      {step.kind === "registration" && (
        <RegistrationStep
          defaultData={defaultRegistration}
          onNext={handleRegistrationNext}
        />
      )}
      {step.kind === "dimension" && (
        <DimensionStep
          key={step.index}
          config={dimensionConfigs[step.index]}
          track={registration.track}
          initialAnswers={answers[dimensionOrder[step.index]]}
          onNext={(sectionAnswers: (string | number | null)[]) =>
            handleDimensionNext(dimensionOrder[step.index], sectionAnswers)
          }
        />
      )}
      {step.kind === "results" && (
        results
          ? <ResultsScreen
              name={registration.name}
              dimensions={results.dimensions}
              potentialScore={results.potentialScore}
              onNext={handleResultsNext}
            />
          : <p className="text-center text-slate-500 py-8">Calculating results…</p>
      )}
      {step.kind === "thankyou" && (
        <ThankYouScreen name={registration.name} />
      )}
    </AssessmentShell>
  );
}
