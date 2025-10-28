"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

function LoginInner() {
  const roteador = useRouter();
  const parâmetros = useSearchParams();
  const papel = parâmetros.get("papel") || "cliente";

  const [usuárioAtual, definirUsuárioAtual] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });

  // ... o resto do seu código atual de login
  return (
    <div>
      {/* aqui fica o seu layout de login */}
    </div>
  );
}

export default function PáginaDeLogin() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginInner />
    </Suspense>
  );
}
