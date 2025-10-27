"use client";

import { useState, useEffect } from "react";
import { createTicket, listUserProperties } from "@/lib/appActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, MapPin, X, Building } from "lucide-react";

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

interface NewTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (ticketId: string) => void;
  userUid: string;
}

export function NewTicketModal({ open, onClose, onSubmitted, userUid }: NewTicketModalProps) {
  const [form, setForm] = useState({
    propertyId: undefined as string | undefined,
    serviceType: undefined as string | undefined,
    title: "",
    description: "",
    priority: "normal" as "normal" | "urgente",
    usedAdHocAddress: false,
    adHocAddress: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip: ""
    }
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [addressMode, setAddressMode] = useState<"property" | "adhoc" | "no-property">("property");

  useEffect(() => {
    if (open && userUid) {
      loadProperties();
      // Reset form when modal opens
      setForm({
        propertyId: undefined,
        serviceType: undefined,
        title: "",
        description: "",
        priority: "normal",
        usedAdHocAddress: false,
        adHocAddress: {
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip: ""
        }
      });
      setFiles([]);
      setAddressMode("property");
    }
  }, [open, userUid]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const propertiesData = await listUserProperties(userUid);
      setProperties(propertiesData as Property[]);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      toast.error("Erro ao carregar imóveis");
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.serviceType || !form.title) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validar endereço quando necessário
    if (addressMode === "adhoc" || addressMode === "no-property") {
      if (!form.adHocAddress.street || !form.adHocAddress.city) {
        toast.error("Preencha o endereço completo");
        return;
      }
    } else if (addressMode === "property" && !form.propertyId) {
      toast.error("Selecione um imóvel");
      return;
    }

    try {
      setLoading(true);
      
      // Preparar payload baseado no modo de endereço
      const payload = {
        ownerUid: userUid,
        propertyId: addressMode === "no-property" ? null : form.propertyId,
        serviceType: form.serviceType,
        title: form.title,
        description: form.description,
        priority: form.priority,
        photos: files,
        usedAdHocAddress: addressMode !== "property",
        adHocAddress: addressMode !== "property" ? form.adHocAddress : undefined
      };

      const id = await createTicket(payload);
      
      toast.success("Chamado criado com sucesso!");
      onClose();
      onSubmitted && onSubmitted(id);
      
    } catch (err: any) {
      console.error("❌ Erro ao criar chamado:", err);
      toast.error("Não foi possível criar o chamado.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 5) {
      toast.error("Máximo 5 fotos permitidas");
      return;
    }
    setFiles(selectedFiles);
  };

  const getSelectedProperty = () => {
    return properties.find(p => p.id === form.propertyId);
  };

  const getPlanBadge = (property: Property) => {
    if (!property.planId) {
      return <Badge variant="outline" className="text-xs">Sem plano</Badge>;
    }
    
    const planNames = {
      essencial: "Essencial",
      completo: "Completo", 
      super_premium: "Super Premium"
    };
    
    const isActive = property.planStatus === "ativo";
    
    return (
      <Badge 
        className={`text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
      >
        {planNames[property.planId as keyof typeof planNames] || property.planId}
      </Badge>
    );
  };

  const getPropertyDisplayText = (property: Property) => {
    const planText = property.planId ? 
      (property.planStatus === "ativo" ? "Com plano" : "Plano inativo") : 
      "Sem plano";
    return `${property.label} — ${property.address?.city ?? ""} (${planText})`;
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Novo Chamado</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Imóvel ou Endereço */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Imóvel / Endereço *
            </Label>
            
            {addressMode === "property" && (
              <div className="mt-1">
                <div className="flex gap-2">
                  <Select 
                    value={form.propertyId || ""} 
                    onValueChange={(v) => setForm(f => ({ ...f, propertyId: v || undefined }))}
                    disabled={loadingProperties}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={loadingProperties ? "Carregando..." : "Selecione o imóvel"} />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {getPropertyDisplayText(property)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info("Cadastre um imóvel na aba 'Meus Imóveis'")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Mostrar endereço do imóvel selecionado */}
                {form.propertyId && (() => {
                  const property = getSelectedProperty();
                  return property ? (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {property.address.street} {property.address.number}, {property.address.neighborhood && `${property.address.neighborhood}, `}{property.address.city}
                        </div>
                        {getPlanBadge(property)}
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {/* Links para outros modos */}
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressMode("adhoc")}
                    className="text-sm text-teal-600 hover:text-teal-700 underline text-left"
                  >
                    Usar outro endereço (avulso)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode("no-property")}
                    className="text-sm text-teal-600 hover:text-teal-700 underline text-left"
                  >
                    Sem imóvel / orçamento avulso
                  </button>
                </div>
              </div>
            )}

            {/* Formulário de endereço avulso */}
            {(addressMode === "adhoc" || addressMode === "no-property") && (
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {addressMode === "adhoc" ? "Endereço avulso" : "Orçamento sem imóvel"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adhoc-street" className="text-sm">Rua *</Label>
                    <Input
                      id="adhoc-street"
                      value={form.adHocAddress.street}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, street: e.target.value }
                      }))}
                      placeholder="Nome da rua"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adhoc-number" className="text-sm">Número</Label>
                    <Input
                      id="adhoc-number"
                      value={form.adHocAddress.number}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, number: e.target.value }
                      }))}
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adhoc-neighborhood" className="text-sm">Bairro</Label>
                    <Input
                      id="adhoc-neighborhood"
                      value={form.adHocAddress.neighborhood}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, neighborhood: e.target.value }
                      }))}
                      placeholder="Nome do bairro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adhoc-city" className="text-sm">Cidade *</Label>
                    <Input
                      id="adhoc-city"
                      value={form.adHocAddress.city}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, city: e.target.value }
                      }))}
                      placeholder="Nome da cidade"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adhoc-state" className="text-sm">Estado</Label>
                    <Input
                      id="adhoc-state"
                      value={form.adHocAddress.state}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, state: e.target.value }
                      }))}
                      placeholder="SP"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adhoc-zip" className="text-sm">CEP</Label>
                    <Input
                      id="adhoc-zip"
                      value={form.adHocAddress.zip}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adHocAddress: { ...prev.adHocAddress, zip: e.target.value }
                      }))}
                      placeholder="00000-000"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setAddressMode("property")}
                  className="text-sm text-gray-600 hover:text-gray-700 underline"
                >
                  ← Voltar para seleção de imóvel
                </button>
              </div>
            )}
          </div>

          {/* Tipo de Serviço */}
          <div>
            <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
              Tipo de Serviço *
            </Label>
            <Select 
              value={form.serviceType || ""} 
              onValueChange={(v) => setForm(f => ({ ...f, serviceType: v || undefined }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eletrica">Elétrica</SelectItem>
                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                <SelectItem value="pintura">Pintura</SelectItem>
                <SelectItem value="telhado">Telhado</SelectItem>
                <SelectItem value="marcenaria">Marcenaria</SelectItem>
                <SelectItem value="limpeza">Limpeza</SelectItem>
                <SelectItem value="jardinagem">Jardinagem</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Torneira da cozinha vazando"
              className="mt-1"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição Detalhada *
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o problema em detalhes..."
              rows={4}
              className="mt-1"
              required
            />
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Prioridade
            </Label>
            <Select 
              value={form.priority} 
              onValueChange={(value: "normal" | "urgente") => setForm(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload de Fotos */}
          <div>
            <Label htmlFor="photos" className="text-sm font-medium text-gray-700">
              Fotos (até 5)
            </Label>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mt-1 cursor-pointer"
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {files.length} foto(s) selecionada(s)
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Fechar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !form.serviceType || !form.title}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "Enviando..." : "Enviar chamado"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}