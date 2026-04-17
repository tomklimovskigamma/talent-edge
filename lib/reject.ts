// lib/reject.ts
export const DEFAULT_REJECTION_TEMPLATE = `Hi {name},

Thank you for your interest in the {program}. After careful consideration, we will not be progressing with your application at this time.

We wish you the best in your continued career journey.

Kind regards,
The Meridian Group Talent Team`;

export function expandRejectionTemplate(
  template: string,
  candidate: { name: string },
  programName: string
): string {
  return template
    .replaceAll("{name}", candidate.name)
    .replaceAll("{program}", programName);
}
