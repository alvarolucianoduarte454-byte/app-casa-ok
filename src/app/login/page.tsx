"use client";


import { useState, useEffect } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "cliente";
  
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [signupForm, setSignupForm] = useState({ nome: "", email: "", senha: "" });
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Lista de emails admin (pode ser configurada via env)
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Se usuário já está autenticado, redirecionar para o painel correto
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            redirectToPanel(userData.role || "cliente");
          } else {
            redirectToPanel("cliente");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          redirectToPanel("cliente");
        }
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const redirectToPanel = (userRole: string) => {
    switch (userRole) {
      case "cliente":
        router.push("/dashboard");
        break;
      case "imobiliaria":
        router.push("/imobiliaria");
        break;
      case "tecnico":
        router.push("/tecnico");
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        router.push("/dashboard");
    }
  };

  const determineUserRole = (email: string, requestedRole: string) => {
    // Se email está na lista de admins, sempre será admin
    if (adminEmails.includes(email)) {
      return "admin";
    }
    
    // Caso contrário, usar o role solicitado
    return requestedRole;
  };

  const createOrUpdateUser = async (user: any, requestedRole: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      let finalRole = requestedRole;
      
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        // Se usuário já existe, manter role existente (exceto se for admin por email)
        if (adminEmails.includes(user.email)) {
          finalRole = "admin";
        } else if (existingData.role) {
          finalRole = existingData.role;
        }
      } else {
        // Novo usuário - determinar role
        finalRole = determineUserRole(user.email, requestedRole);
      }

      // Criar/atualizar documento do usuário
      await setDoc(userRef, {
        fullName: user.displayName || signupForm.nome || "Usuário",
        email: user.email,
        role: finalRole,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      return finalRole;
    } catch (error) {
      console.error("Erro ao criar/atualizar usuário:", error);
      throw error;
    }
  };

  const handleSignUp = async () => {
    if (!signupForm.email || !signupForm.senha || !signupForm.nome) {
      setAuthError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      const user = await signUpWithEmail(signupForm.email, signupForm.senha);
      const userRole = await createOrUpdateUser(user, role);
      redirectToPanel(userRole);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      setAuthError(getErrorMessage(error.code) || "Erro no cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!loginForm.email || !loginForm.senha) {
      setAuthError("Por favor, preencha email e senha");
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      const user = await signInWithEmail(loginForm.email, loginForm.senha);
      const userRole = await createOrUpdateUser(user, role);
      redirectToPanel(userRole);
    } catch (error: any) {
      console.error("Erro no login:", error);
      setAuthError(getErrorMessage(error.code) || "Erro no login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError("");

    try {
      const user = await signInWithGoogle();
      
      if (user === null) {
        console.log("🔄 Redirecionando para Google Auth...");
        return;
      }
      
      const userRole = await createOrUpdateUser(user, role);
      redirectToPanel(userRole);
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      setAuthError(getErrorMessage(error.code) || "Erro no login com Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "Usuário não encontrado";
      case "auth/wrong-password":
        return "Senha incorreta";
      case "auth/email-already-in-use":
        return "Este email já está em uso";
      case "auth/weak-password":
        return "A senha deve ter pelo menos 6 caracteres";
      case "auth/invalid-email":
        return "Email inválido";
      case "auth/popup-closed-by-user":
        return "Login cancelado pelo usuário";
      default:
        return "Erro no login. Tente novamente.";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A39A] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/07c47844-ad36-4409-b846-9594009a58b4.png" 
              alt="Casa OK Logo" 
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </header>
      
      <main className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/07c47844-ad36-4409-b846-9594009a58b4.png" 
                alt="Casa OK Logo" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl text-[#222222]">
              Entrar como {role === "cliente" ? "Cliente" : role === "imobiliaria" ? "Imobiliária" : role === "tecnico" ? "Técnico" : "Admin"}
            </CardTitle>
            <CardDescription>Faça login ou crie sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm({...loginForm, senha: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  className="w-full bg-[#00A39A] hover:bg-[#008A82]"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={signupForm.nome}
                    onChange={(e) => setSignupForm({...signupForm, nome: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-signup">Senha</Label>
                  <Input
                    id="senha-signup"
                    type="password"
                    placeholder="••••••••"
                    value={signupForm.senha}
                    onChange={(e) => setSignupForm({...signupForm, senha: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  className="w-full bg-[#00A39A] hover:bg-[#008A82]"
                  onClick={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </TabsContent>
            </Tabs>
            
            {authError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mt-4">
                {authError}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar com Google"}
              </Button>
            </div>
            
            <div className="text-center pt-4">
              <Link href="/">
                <Button variant="ghost">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
