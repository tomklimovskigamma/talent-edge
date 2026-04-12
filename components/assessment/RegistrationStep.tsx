export function RegistrationStep({ defaultData, onNext }: any) {
  return <button onClick={() => onNext(defaultData)}>Next</button>;
}
