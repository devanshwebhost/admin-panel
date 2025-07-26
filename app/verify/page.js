import { Suspense } from "react";
import VerifyEmail from "@/components/VerifyClient";

export default function VerifyPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading verification...</div>}>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
