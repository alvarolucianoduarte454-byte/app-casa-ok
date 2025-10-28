import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}


