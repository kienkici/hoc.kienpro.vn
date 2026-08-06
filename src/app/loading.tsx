import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container max-w-7xl mx-auto p-6 md:p-12">
      <LoadingSkeleton type="card" count={3} />
    </div>
  );
}
