import { Suspense } from "react";
import NeuralFlowLoader from "./NeuralFlowLoader";

export default function LazyPage({ children, message }) {
  return (
    <Suspense fallback={<NeuralFlowLoader fullPage={false} message={message} />}>
      {children}
    </Suspense>
  );
}
