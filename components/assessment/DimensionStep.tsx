export function DimensionStep({ config, track, initialAnswers, onNext }: any) {
  return <button onClick={() => onNext(initialAnswers)}>Next</button>;
}
