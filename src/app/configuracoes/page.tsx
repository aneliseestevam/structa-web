'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import NotificationTrigger from '@/components/notifications/NotificationTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Building, 
  Shield, 
  Download, 
  Upload, 
  Bell, 
  Palette, 
  Globe, 
  Save,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Configurações de Perfil
  const [perfilData, setPerfilData] = useState({
    nome: user?.name || '',
    email: user?.email || '',
    cargo: user?.role || '',
    telefone: '',
    empresa: 'Constructa Ltda',
  });

  // Configurações do Sistema
  const [sistemaData, setSistemaData] = useState({
    tema: 'light',
    idioma: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    notificacoes: true,
    notificacoesSom: false,
    notificacoesEmail: true,
    autoSave: true,
    backupAutomatico: true,
  });

  // Configurações de Obras
  const [obrasData, setObrasData] = useState({
    etapasPadrao: ['Fundação', 'Estrutura', 'Alvenaria', 'Acabamento'],
    categoriasMateriais: ['Cimento e Argamassa', 'Estrutura Metálica', 'Acabamento', 'Hidráulica', 'Elétrica'],
    alertaEstoqueMinimo: true,
    alertaPrazos: true,
    moedaPadrao: 'BRL',
    formatoData: 'DD/MM/AAAA',
  });

  const handleSalvarPerfil = async () => {
    setIsLoading(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Perfil atualizado com sucesso!');
    setIsLoading(false);
  };

  const handleSalvarSistema = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Configurações do sistema atualizadas!');
    setIsLoading(false);
  };

  const handleSalvarObras = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Configurações de obras atualizadas!');
    setIsLoading(false);
  };

  const handleExportarDados = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Simular download
    const element = document.createElement('a');
    const file = new Blob(['{"message": "Dados exportados com sucesso"}'], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `structa-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setIsLoading(false);
  };

  const handleResetarConfiguracao = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Resetar para padrões
    setSistemaData({
      tema: 'light',
      idioma: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      notificacoes: true,
      notificacoesSom: false,
      notificacoesEmail: true,
      autoSave: true,
      backupAutomatico: true,
    });
    setShowResetDialog(false);
    alert('Configurações resetadas para o padrão!');
    setIsLoading(false);
  };

  const adicionarEtapaPadrao = () => {
    const novaEtapa = prompt('Nome da nova etapa:');
    if (novaEtapa && !obrasData.etapasPadrao.includes(novaEtapa)) {
      setObrasData({
        ...obrasData,
        etapasPadrao: [...obrasData.etapasPadrao, novaEtapa]
      });
    }
  };

  const removerEtapaPadrao = (etapa: string) => {
    setObrasData({
      ...obrasData,
      etapasPadrao: obrasData.etapasPadrao.filter(e => e !== etapa)
    });
  };

  const adicionarCategoriaMaterial = () => {
    const novaCategoria = prompt('Nome da nova categoria:');
    if (novaCategoria && !obrasData.categoriasMateriais.includes(novaCategoria)) {
      setObrasData({
        ...obrasData,
        categoriasMateriais: [...obrasData.categoriasMateriais, novaCategoria]
      });
    }
  };

  const removerCategoriaMaterial = (categoria: string) => {
    setObrasData({
      ...obrasData,
      categoriasMateriais: obrasData.categoriasMateriais.filter(c => c !== categoria)
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="obras" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Obras
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={perfilData.nome}
                      onChange={(e) => setPerfilData({ ...perfilData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={perfilData.email}
                      onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Select 
                      value={perfilData.cargo} 
                      onValueChange={(value) => setPerfilData({ ...perfilData, cargo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="engineer">Engenheiro</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={perfilData.telefone}
                      onChange={(e) => setPerfilData({ ...perfilData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={perfilData.empresa}
                      onChange={(e) => setPerfilData({ ...perfilData, empresa: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSalvarPerfil} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sistema */}
          <TabsContent value="sistema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <CardDescription>
                  Configure a aparência e comportamento do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aparência */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Aparência
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <Select 
                        value={sistemaData.tema} 
                        onValueChange={(value) => setSistemaData({ ...sistemaData, tema: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select 
                        value={sistemaData.idioma} 
                        onValueChange={(value) => setSistemaData({ ...sistemaData, idioma: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notificações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                      </div>
                      <Switch
                        checked={sistemaData.notificacoes}
                        onCheckedChange={(checked) => setSistemaData({ ...sistemaData, notificacoes: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Som das Notificações</Label>
                        <p className="text-sm text-muted-foreground">Reproduzir som ao receber notificações</p>
                      </div>
                      <Switch
                        checked={sistemaData.notificacoesSom}
                        onCheckedChange={(checked) => setSistemaData({ ...sistemaData, notificacoesSom: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">Receber resumos diários por email</p>
                      </div>
                      <Switch
                        checked={sistemaData.notificacoesEmail}
                        onCheckedChange={(checked) => setSistemaData({ ...sistemaData, notificacoesEmail: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sistema */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Salvamento Automático</Label>
                        <p className="text-sm text-muted-foreground">Salvar alterações automaticamente</p>
                      </div>
                      <Switch
                        checked={sistemaData.autoSave}
                        onCheckedChange={(checked) => setSistemaData({ ...sistemaData, autoSave: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Backup Automático</Label>
                        <p className="text-sm text-muted-foreground">Criar backups automáticos dos dados</p>
                      </div>
                      <Switch
                        checked={sistemaData.backupAutomatico}
                        onCheckedChange={(checked) => setSistemaData({ ...sistemaData, backupAutomatico: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Teste de Notificações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Teste de Notificações</h3>
                  <NotificationTrigger />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSalvarSistema} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Obras */}
          <TabsContent value="obras" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Obras</CardTitle>
                <CardDescription>
                  Defina padrões e preferências para gestão de obras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Etapas Padrão */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Etapas Padrão</h3>
                  <p className="text-sm text-muted-foreground">
                    Etapas que serão criadas automaticamente para novas obras
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {obrasData.etapasPadrao.map((etapa, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {etapa}
                        <button
                          onClick={() => removerEtapaPadrao(etapa)}
                          className="hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm" onClick={adicionarEtapaPadrao}>
                      + Adicionar Etapa
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Categorias de Materiais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Categorias de Materiais</h3>
                  <p className="text-sm text-muted-foreground">
                    Categorias disponíveis para classificação de materiais
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {obrasData.categoriasMateriais.map((categoria, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-2">
                        {categoria}
                        <button
                          onClick={() => removerCategoriaMaterial(categoria)}
                          className="hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm" onClick={adicionarCategoriaMaterial}>
                      + Adicionar Categoria
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Alertas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alertas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alerta de Estoque Mínimo</Label>
                        <p className="text-sm text-muted-foreground">Notificar quando materiais estiverem com estoque baixo</p>
                      </div>
                      <Switch
                        checked={obrasData.alertaEstoqueMinimo}
                        onCheckedChange={(checked) => setObrasData({ ...obrasData, alertaEstoqueMinimo: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alerta de Prazos</Label>
                        <p className="text-sm text-muted-foreground">Notificar sobre prazos de entrega próximos</p>
                      </div>
                      <Switch
                        checked={obrasData.alertaPrazos}
                        onCheckedChange={(checked) => setObrasData({ ...obrasData, alertaPrazos: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSalvarObras} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Dados</CardTitle>
                <CardDescription>
                  Gerencie seus dados e configurações de backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Exportar Dados</h4>
                      <p className="text-sm text-muted-foreground">
                        Baixe todos os seus dados em formato JSON
                      </p>
                    </div>
                    <Button onClick={handleExportarDados} disabled={isLoading}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Importar Dados</h4>
                      <p className="text-sm text-muted-foreground">
                        Restaure dados de um backup anterior
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Zona de Perigo
                  </h3>
                  
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-red-800">Resetar Configurações</h4>
                        <p className="text-sm text-red-600">
                          Restaura todas as configurações para os valores padrão
                        </p>
                      </div>
                      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar Reset</DialogTitle>
                            <DialogDescription>
                              Esta ação não pode ser desfeita. Todas as suas configurações personalizadas serão perdidas e restauradas para os valores padrão.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                              Cancelar
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleResetarConfiguracao}
                              disabled={isLoading}
                            >
                              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Confirmar Reset
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 