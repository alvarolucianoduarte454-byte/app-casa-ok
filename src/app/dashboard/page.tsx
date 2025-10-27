"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { requireRole, redirectToUserPanel } from "@/lib/roleGuard";
import { 
  listUserTickets, 
  listUserProperties, 
  listUserQuotes,
  addProperty,
  approveQuote,
  rejectQuote
} from "@/lib/appActions";
import { NewTicketModal } from "@/components/NewTicketModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, 
  Home, 
  Ticket, 
  FileText, 
  MessageCircle, 
  Camera, 
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Check
} from "lucide-react";

interface Property {
  id: string;
  label: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  planId: string | null;
  planStatus: string;
}

interface TicketData {
  id: string;
  propertyId: string | null;
  serviceType: string;
  title: string;
  description: string;
  photos: string[];
  priority: "normal" | "urgente";
  status: "novo" | "em_andamento" | "concluido" | "orçamento";
  includedInPlan: boolean;
  usedAdHocAddress?: boolean;
  adHocAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: any;
}

interface Quote {
  id: string;
  ticketId: string;
  serviceType: string;
  descriptionCliente: string;
  estimatedValue: number | null;
  status: "aguardando" | "enviado" | "aprovado" | "recusado";
  createdAt: any;
}

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  concluido: "bg-green-100 text-green-800",
  orçamento: "bg-purple-100 text-purple-800"
};

const priorityColors = {
  normal: "bg-gray-100 text-gray-800",
  urgente: "bg-red-100 text-red-800"
};

const planNames = {
  essencial: "Essencial",
  completo: "Completo",
  super_premium: "Super Premium"
};

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [openNewTicket, setOpenNewTicket] = useState(false);
  const [showNewProperty, setShowNewProperty] = useState(false);
  const [showPhotos, setShowPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state for property
  const [propertyForm, setPropertyForm] = useState({
    label: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
    planId: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      const result = await requireRole(["cliente"]);
      
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

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoadingData(true);
    try {
      const [ticketsData, propertiesData, quotesData] = await Promise.all([
        listUserTickets(currentUser.uid),
        listUserProperties(currentUser.uid),
        listUserQuotes(currentUser.uid)
      ]);
      
      setTickets(ticketsData as TicketData[]);
      setProperties(propertiesData as Property[]);
      setQuotes(quotesData as Quote[]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!propertyForm.label || !propertyForm.street || !propertyForm.city) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      await addProperty(currentUser.uid, {
        label: propertyForm.label,
        address: {
          street: propertyForm.street,
          number: propertyForm.number,
          neighborhood: propertyForm.neighborhood,
          city: propertyForm.city,
          state: propertyForm.state,
          zip: propertyForm.zip
        },
        planId: propertyForm.planId || null
      });

      toast.success("Imóvel adicionado com sucesso!");
      setShowNewProperty(false);
      setPropertyForm({
        label: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zip: "",
        planId: ""
      });
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar imóvel:", error);
      toast.error("Erro ao adicionar imóvel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveQuote = async (quoteId: string) => {
    try {
      await approveQuote(quoteId);
      toast.success("Orçamento aprovado!");
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar orçamento:", error);
      toast.error("Erro ao aprovar orçamento");
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      await rejectQuote(quoteId);
      toast.success("Orçamento recusado!");
      loadData();
    } catch (error) {
      console.error("Erro ao recusar orçamento:", error);
      toast.error("Erro ao recusar orçamento");
    }
  };

  const handleTicketSubmitted = (ticketId: string) => {
    // Recarregar dados após criar chamado
    loadData();
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = selectedStatus === "all" || ticket.status === selectedStatus;
    const propertyMatch = selectedProperty === "all" || ticket.propertyId === selectedProperty;
    return statusMatch && propertyMatch;
  });

  const getPropertyById = (id: string | null) => {
    if (!id) return null;
    return properties.find(p => p.id === id);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Painel do Cliente</h1>
              <p className="text-gray-600">Olá, {currentUser?.displayName || currentUser?.email}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push("/")}
              >
                Voltar ao Início
              </Button>
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => setOpenNewTicket(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Chamado
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Seção: Meus Chamados */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Meus Chamados
              </h2>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="orçamento">Orçamento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os imóveis</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Chamados */}
            <div className="grid gap-6">
              {filteredTickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Ticket className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
                    <p className="text-gray-600 text-center mb-4">
                      {tickets.length === 0 
                        ? "Você ainda não criou nenhum chamado. Clique em 'Novo Chamado' para começar."
                        : "Nenhum chamado corresponde aos filtros selecionados."
                      }
                    </p>
                    <Button 
                      onClick={() => setOpenNewTicket(true)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Chamado
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredTickets.map(ticket => {
                  const property = getPropertyById(ticket.propertyId);
                  return (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{ticket.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={statusColors[ticket.status]}>
                                {ticket.status === "novo" && "Novo"}
                                {ticket.status === "em_andamento" && "Em andamento"}
                                {ticket.status === "concluido" && "Concluído"}
                                {ticket.status === "orçamento" && "Orçamento"}
                              </Badge>
                              <Badge className={priorityColors[ticket.priority]}>
                                {ticket.priority === "normal" ? "Normal" : "Urgente"}
                              </Badge>
                              {ticket.includedInPlan ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Coberto pelo plano
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800">
                                  Orçamento
                                </Badge>
                              )}
                              {ticket.usedAdHocAddress && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Endereço avulso
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {ticket.createdAt?.toDate?.()?.toLocaleDateString() || "Data não disponível"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Serviço:</p>
                            <p className="text-gray-900">{ticket.serviceType}</p>
                          </div>
                          
                          {/* Mostrar endereço do imóvel ou endereço avulso */}
                          {property && !ticket.usedAdHocAddress && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Imóvel:</p>
                              <div className="flex items-center gap-2 text-gray-900">
                                <MapPin className="w-4 h-4" />
                                {property.label} - {property.address.street} {property.address.number}, {property.address.city}
                              </div>
                            </div>
                          )}

                          {ticket.usedAdHocAddress && ticket.adHocAddress && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Endereço:</p>
                              <div className="flex items-center gap-2 text-gray-900">
                                <MapPin className="w-4 h-4" />
                                {ticket.adHocAddress.street} {ticket.adHocAddress.number}, {ticket.adHocAddress.neighborhood && `${ticket.adHocAddress.neighborhood}, `}{ticket.adHocAddress.city}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-700">Descrição:</p>
                            <p className="text-gray-900">{ticket.description}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                            {ticket.photos && ticket.photos.length > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowPhotos(ticket.photos)}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Fotos ({ticket.photos.length})
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Seção: Meus Imóveis */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Meus Imóveis
              </h2>
              <Dialog open={showNewProperty} onOpenChange={setShowNewProperty}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Imóvel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Imóvel</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProperty} className="space-y-4">
                    <div>
                      <Label htmlFor="label">Nome do Imóvel *</Label>
                      <Input
                        id="label"
                        value={propertyForm.label}
                        onChange={(e) => setPropertyForm(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Ex: Apto Praia, Casa Centro"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          value={propertyForm.street}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, street: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={propertyForm.number}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                          id="neighborhood"
                          value={propertyForm.neighborhood}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={propertyForm.city}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={propertyForm.state}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">CEP</Label>
                        <Input
                          id="zip"
                          value={propertyForm.zip}
                          onChange={(e) => setPropertyForm(prev => ({ ...prev, zip: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="plan">Plano</Label>
                      <Select 
                        value={propertyForm.planId} 
                        onValueChange={(value) => setPropertyForm(prev => ({ ...prev, planId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sem plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem plano</SelectItem>
                          <SelectItem value="essencial">Essencial</SelectItem>
                          <SelectItem value="completo">Completo</SelectItem>
                          <SelectItem value="super_premium">Super Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewProperty(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Salvando..." : "Salvar Imóvel"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {properties.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Home className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel cadastrado</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Adicione seus imóveis para poder criar chamados de manutenção.
                    </p>
                    <Button onClick={() => setShowNewProperty(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Imóvel
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                properties.map(property => (
                  <Card key={property.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        {property.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                          <div className="text-sm">
                            <p>{property.address.street} {property.address.number}</p>
                            {property.address.neighborhood && <p>{property.address.neighborhood}</p>}
                            <p>{property.address.city} - {property.address.state}</p>
                            {property.address.zip && <p>CEP: {property.address.zip}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {property.planId ? (
                            <>
                              <Badge className="bg-blue-100 text-blue-800">
                                {planNames[property.planId as keyof typeof planNames] || property.planId}
                              </Badge>
                              <Badge 
                                className={
                                  property.planStatus === "ativo" 
                                    ? "bg-green-100 text-green-800"
                                    : property.planStatus === "pendente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {property.planStatus === "ativo" && "Ativo"}
                                {property.planStatus === "pendente" && "Pendente"}
                                {property.planStatus === "inativo" && "Inativo"}
                              </Badge>
                            </>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Sem plano
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Seção: Orçamentos */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Orçamentos
            </h2>
            
            <div className="grid gap-6">
              {quotes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
                    <p className="text-gray-600 text-center">
                      Os orçamentos aparecerão aqui quando você criar chamados para serviços não cobertos pelo seu plano.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                quotes.map(quote => (
                  <Card key={quote.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Orçamento - {quote.serviceType}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              className={
                                quote.status === "aguardando" 
                                  ? "bg-yellow-100 text-yellow-800"
                                  : quote.status === "enviado"
                                  ? "bg-blue-100 text-blue-800"
                                  : quote.status === "aprovado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {quote.status === "aguardando" && "Aguardando"}
                              {quote.status === "enviado" && "Enviado"}
                              {quote.status === "aprovado" && "Aprovado"}
                              {quote.status === "recusado" && "Recusado"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {quote.createdAt?.toDate?.()?.toLocaleDateString() || "Data não disponível"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Descrição:</p>
                          <p className="text-gray-900">{quote.descriptionCliente}</p>
                        </div>

                        {quote.estimatedValue && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Valor Estimado:</p>
                            <p className="text-lg font-semibold text-green-600">
                              R$ {quote.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}

                        {quote.status === "enviado" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveQuote(quote.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectQuote(quote.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Recusar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Chamado */}
      <NewTicketModal
        open={openNewTicket}
        onClose={() => setOpenNewTicket(false)}
        onSubmitted={handleTicketSubmitted}
        userUid={currentUser?.uid || ""}
      />

      {/* Lightbox para fotos */}
      {showPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fotos do Chamado</h3>
              <Button variant="outline" size="sm" onClick={() => setShowPhotos([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 grid gap-4 md:grid-cols-2">
              {showPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}