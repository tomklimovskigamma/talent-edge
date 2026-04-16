import { candidates } from "@/lib/data/candidates";
import { VideoInterviewShell } from "@/components/video-interview/VideoInterviewShell";
import { notFound } from "next/navigation";

export default async function VideoInterviewPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) notFound();

  return <VideoInterviewShell candidate={candidate} />;
}
