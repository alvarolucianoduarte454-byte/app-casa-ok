"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { requireRole, redirectToUserPanel } from "@/lib/roleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Calendar, MapPin, Clock } from "lucide-react";

export default function TecnicoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await requireRole(["tecnico", "admin"]);
      
      if (!result) {
        // Se não está logado, redirecionar para login
        const unsub = onAuthStateChanged(auth, (user) => {
          if (!user) {
            router.push("/login?role=cliente");
          } else {
            // Se está logado mas sem permissão, redirecionar para painel correto
            router.push(redirectToUserPanel("cliente"));
          }
          unsub();
        });
        return;
      }

      setCurrentUser(result.user);
      setUserRole(result.role);
      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel do Técnico</h1>
              <p className="text-gray-600">Olá, {currentUser?.displayName || currentUser?.email}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chamados Pendentes</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Visitas programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Painel do Técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bem-vindo ao Painel do Técnico
                </h3>
                <p className="text-gray-600 mb-6">
                  Gerencie seus chamados, agendamentos e acompanhe o progresso dos serviços.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Visualize chamados atribuídos a você</p>
                  <p>• Gerencie sua agenda de visitas</p>
                  <p>• Atualize status dos serviços</p>
                  <p>• Envie fotos e relatórios</p>
                  <p>• Chat direto com clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}