"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "cliente";

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signupForm, setSignupForm] = useState({ email: "", senha: "" });
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);

        if (!userDoc.exists()) {
          await setDoc(docRef, { role });
        }
        setCurrentUser(user);
        router.push(`/dashboard`);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, role]);

  if (authLoading) return <div>Carregando...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signInWithEmail(loginForm.email, loginForm.senha);
                }}
              >
                <Label>Email</Label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={loginForm.senha}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, senha: e.target.value })
                  }
                />
                <Button type="submit" className="mt-4 w-full">
                  Entrar
                </Button>
              </form>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => signInWithGoogle()}
              >
                Entrar com Google
              </Button>
            </TabsContent>
            <TabsContent value="signup">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signUpWithEmail(signupForm.email, signupForm.senha);
                }}
              >
                <Label>Email</Label>
                <Input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                />
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={signupForm.senha}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, senha: e.target.value })
                  }
                />
                <Button type="submit" className="mt-4 w-full">
                  Cadastrar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
