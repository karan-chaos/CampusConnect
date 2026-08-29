import { Suspense, lazy } from "react";
import { RouteSkeleton } from "@/components/RouteSkeleton";

const ExpenseSplitterPage = lazy(() => import("@/components/expense-splitter/ExpenseSplitterPage"));

export default function ExpenseSplitterRoute() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <ExpenseSplitterPage />
    </Suspense>
  );
}
