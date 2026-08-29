import { Suspense, lazy } from "react";
import { RouteSkeleton } from "@/components/RouteSkeleton";

const ResourceBookingPage = lazy(() => import("@/components/resource-booking/ResourceBookingPage"));

export default function ResourceBookingRoute() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <ResourceBookingPage />
    </Suspense>
  );
}
