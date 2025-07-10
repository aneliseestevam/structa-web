'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Obra, Etapa, Material, MovimentacaoEstoque, Compra } from '@/types';

// Definir tipo para notificação (evitar import circular)
interface NotificationFunction {
  (notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
  }): void;
}

interface DataContextType {
  // Obras
  obras: Obra[];
  setObras: React.Dispatch<React.SetStateAction<Obra[]>>;
  addObra: (obra: Obra) => void;
  updateObra: (id: string, obraData: Partial<Obra>) => void;
  deleteObra: (id: string) => void;
  
  // Etapas
  etapas: Etapa[];
  setEtapas: React.Dispatch<React.SetStateAction<Etapa[]>>;
  addEtapa: (etapa: Etapa) => void;
  updateEtapa: (id: string, etapaData: Partial<Etapa>) => void;
  deleteEtapa: (id: string) => void;
  
  // Relacionamentos Obra-Etapas
  getEtapasByObra: (obraId: string) => Etapa[];
  getProgressoObra: (obraId: string) => number;
  getEtapasCompletadas: (obraId: string) => number;
  getEtapasTotal: (obraId: string) => number;
  getProximaEtapa: (obraId: string) => Etapa | null;
  createEtapasTemplate: (obraId: string) => Promise<void>;
  
  // Materiais
  materiais: Material[];
  setMateriais: React.Dispatch<React.SetStateAction<Material[]>>;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, materialData: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  // Movimentações
  movimentacoes: MovimentacaoEstoque[];
  setMovimentacoes: React.Dispatch<React.SetStateAction<MovimentacaoEstoque[]>>;
  addMovimentacao: (movimentacao: MovimentacaoEstoque) => void;
  updateMovimentacao: (id: string, movimentacaoData: Partial<MovimentacaoEstoque>) => void;
  deleteMovimentacao: (id: string) => void;
  
  // Compras
  compras: Compra[];
  setCompras: React.Dispatch<React.SetStateAction<Compra[]>>;
  addCompra: (compra: Compra) => void;
  updateCompra: (id: string, compraData: Partial<Compra>) => void;
  deleteCompra: (id: string) => void;

  // Estado de carregamento
  isLoading: boolean;
  isHydrated: boolean;
  
  // Função para adicionar notificação
  setNotificationFunction: (fn: NotificationFunction) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [notificationFunction, setNotificationFunction] = useState<NotificationFunction | null>(null);

  // Carregamento inicial dos dados apenas após a hidratação
  useEffect(() => {
    const loadData = async () => {
      try {
        // Marcar como hidratado
        setIsHydrated(true);
        setIsLoading(true);
        
        // Simular delay de carregamento para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Em produção, estes dados virão da API
        // Para desenvolvimento, usar dados mock consistentes

        // Mock data - Obras
        const mockObras: Obra[] = [
          {
            id: '1',
            nome: 'Residencial Alpha',
            local: 'Bairro Centro, Cidade A',
            dataInicio: new Date('2024-01-15'),
            dataPrevisao: new Date('2024-12-15'),
            responsavel: 'João Silva',
            status: 'em-andamento',
            orcamento: 2500000,
            custoTotal: 1800000,
            createdAt: new Date('2024-01-10T10:00:00'),
            updatedAt: new Date('2024-01-15T10:00:00'),
          },
          {
            id: '2',
            nome: 'Comercial Beta',
            local: 'Zona Industrial, Cidade B',
            dataInicio: new Date('2024-03-01'),
            dataPrevisao: new Date('2025-01-30'),
            responsavel: 'Maria Santos',
            status: 'planejada',
            orcamento: 3200000,
            createdAt: new Date('2024-02-15T10:00:00'),
            updatedAt: new Date('2024-02-20T10:00:00'),
          },
          {
            id: '3',
            nome: 'Residencial Gamma',
            local: 'Bairro Jardim, Cidade A',
            dataInicio: new Date('2023-08-15'),
            dataFim: new Date('2024-06-30'),
            dataPrevisao: new Date('2024-06-15'),
            responsavel: 'Carlos Oliveira',
            status: 'finalizada',
            orcamento: 1800000,
            custoTotal: 1750000,
            createdAt: new Date('2023-08-10T10:00:00'),
            updatedAt: new Date('2024-07-01T10:00:00'),
          },
        ];

        // Mock data - Etapas
        const mockEtapas: Etapa[] = [
          {
            id: '1',
            nome: 'Fundação',
            descricao: 'Escavação e construção da fundação',
            obraId: '1',
            progresso: 100,
            dataInicio: new Date('2024-01-15'),
            dataFim: new Date('2024-02-28'),
            fotos: ['foto1.jpg', 'foto2.jpg'],
            observacoes: 'Fundação concluída sem intercorrências',
            createdAt: new Date('2024-01-15T10:00:00.000Z'),
            updatedAt: new Date('2024-01-15T10:00:00.000Z'),
          },
          {
            id: '2',
            nome: 'Estrutura',
            descricao: 'Construção da estrutura de concreto armado',
            obraId: '1',
            progresso: 75,
            dataInicio: new Date('2024-03-01T10:00:00.000Z'),
            fotos: ['foto3.jpg'],
            observacoes: 'Estrutura em andamento, dentro do prazo',
            createdAt: new Date('2024-03-01T10:00:00.000Z'),
            updatedAt: new Date('2024-03-01T10:00:00.000Z'),
          },
          {
            id: '3',
            nome: 'Alvenaria',
            descricao: 'Construção das paredes de alvenaria',
            obraId: '1',
            progresso: 30,
            dataInicio: new Date('2024-04-15T10:00:00.000Z'),
            fotos: [],
            createdAt: new Date('2024-04-15T10:00:00.000Z'),
            updatedAt: new Date('2024-04-15T10:00:00.000Z'),
          },
          {
            id: '4',
            nome: 'Fundação',
            descricao: 'Escavação e construção da fundação',
            obraId: '2',
            progresso: 0,
            fotos: [],
            observacoes: 'Aguardando início das obras',
            createdAt: new Date('2024-03-01T10:00:00.000Z'),
            updatedAt: new Date('2024-03-01T10:00:00.000Z'),
          },
        ];

        // Mock data - Materiais
        const mockMateriais: Material[] = [
          {
            id: '1',
            nome: 'Cimento CP-II-Z-32',
            unidade: 'sc',
            fornecedor: 'Votorantim Cimentos',
            preco: 28.50,
            categoria: 'Cimento e Argamassa',
            estoque: 150,
            estoqueMinimo: 50,
            createdAt: new Date('2024-01-01T10:00:00.000Z'),
            updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          },
          {
            id: '2',
            nome: 'Aço CA-50 Ø 8mm',
            unidade: 'kg',
            fornecedor: 'Gerdau',
            preco: 7.80,
            categoria: 'Estrutura Metálica',
            estoque: 2500,
            estoqueMinimo: 1000,
            createdAt: new Date('2024-01-01T10:00:00.000Z'),
            updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          },
          {
            id: '3',
            nome: 'Areia Média',
            unidade: 'm³',
            fornecedor: 'Mineração São João',
            preco: 95.00,
            categoria: 'Cimento e Argamassa',
            estoque: 25,
            estoqueMinimo: 10,
            createdAt: new Date('2024-01-01T10:00:00.000Z'),
            updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          },
          {
            id: '4',
            nome: 'Brita 1',
            unidade: 'm³',
            fornecedor: 'Mineração São João',
            preco: 85.00,
            categoria: 'Cimento e Argamassa',
            estoque: 8,
            estoqueMinimo: 15,
            createdAt: new Date('2024-01-01T10:00:00.000Z'),
            updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          },
        ];

        // Mock data - Movimentações
        const mockMovimentacoes: MovimentacaoEstoque[] = [
          {
            id: '1',
            materialId: '1',
            obraId: '1',
            etapaId: '1',
            tipo: 'entrada',
            quantidade: 100,
            motivo: 'Compra para obra',
            data: new Date('2024-01-10T10:00:00.000Z'),
            responsavel: 'João Silva',
            createdAt: new Date('2024-01-10T10:00:00.000Z'),
            updatedAt: new Date('2024-01-10T10:00:00.000Z'),
          },
          {
            id: '2',
            materialId: '1',
            obraId: '1',
            etapaId: '1',
            tipo: 'saida',
            quantidade: 50,
            motivo: 'Uso na fundação',
            data: new Date('2024-01-15T10:00:00.000Z'),
            responsavel: 'Maria Santos',
            createdAt: new Date('2024-01-15T10:00:00.000Z'),
            updatedAt: new Date('2024-01-15T10:00:00.000Z'),
          },
        ];

        // Mock data - Compras
        const mockCompras: Compra[] = [
          {
            id: '1',
            obraId: '1',
            fornecedor: 'Votorantim Cimentos',
            dataCompra: new Date('2024-01-15T10:00:00.000Z'),
            custoTotal: 2850.00,
            notaFiscal: 'NF-001234',
            status: 'entregue',
            itens: [
              {
                id: '1',
                compraId: '1',
                materialId: '1',
                quantidade: 100,
                precoUnitario: 28.50,
                precoTotal: 2850.00,
              }
            ],
            createdAt: new Date('2024-01-10T10:00:00.000Z'),
            updatedAt: new Date('2024-01-20T10:00:00.000Z'),
          },
        ];

        // Definir dados após um pequeno delay para simular carregamento
        setTimeout(() => {
          setObras(mockObras);
          setEtapas(mockEtapas);
          setMateriais(mockMateriais);
          setMovimentacoes(mockMovimentacoes);
          setCompras(mockCompras);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Apenas na montagem inicial

  // Funções para Obras
  const addObra = useCallback((obra: Obra) => {
    setObras(prev => [...prev, obra]);
  }, []);

  const updateObra = useCallback((id: string, obraData: Partial<Obra>) => {
    setObras(prev => prev.map(obra => 
      obra.id === id ? { ...obra, ...obraData, updatedAt: new Date() } : obra
    ));
  }, []);

  const deleteObra = useCallback((id: string) => {
    setObras(prev => prev.filter(obra => obra.id !== id));
    setEtapas(prev => prev.filter(etapa => etapa.obraId !== id));
    setMovimentacoes(prev => prev.filter(mov => mov.obraId !== id));
    setCompras(prev => prev.filter(compra => compra.obraId !== id));
  }, []);

  // Funções para Etapas
  const addEtapa = useCallback((etapa: Etapa) => {
    setEtapas(prev => [...prev, etapa]);
  }, []);

  const updateEtapa = useCallback((id: string, etapaData: Partial<Etapa>) => {
    setEtapas(prev => prev.map(etapa => 
      etapa.id === id ? { ...etapa, ...etapaData, updatedAt: new Date() } : etapa
    ));
  }, []);

  const deleteEtapa = useCallback((id: string) => {
    setEtapas(prev => prev.filter(etapa => etapa.id !== id));
    setMovimentacoes(prev => prev.filter(mov => mov.etapaId !== id));
  }, []);

  // Funções para Materiais
  const addMaterial = useCallback((material: Material) => {
    setMateriais(prev => [...prev, material]);
  }, []);

  const updateMaterial = useCallback((id: string, materialData: Partial<Material>) => {
    setMateriais(prev => prev.map(material => 
      material.id === id ? { ...material, ...materialData, updatedAt: new Date() } : material
    ));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMateriais(prev => prev.filter(material => material.id !== id));
    setMovimentacoes(prev => prev.filter(mov => mov.materialId !== id));
  }, []);

  // Funções para Movimentações
  const addMovimentacao = useCallback((movimentacao: MovimentacaoEstoque) => {
    setMovimentacoes(prev => [...prev, movimentacao]);
  }, []);

  const updateMovimentacao = useCallback((id: string, movimentacaoData: Partial<MovimentacaoEstoque>) => {
    setMovimentacoes(prev => prev.map(mov => 
      mov.id === id ? { ...mov, ...movimentacaoData, updatedAt: new Date() } : mov
    ));
  }, []);

  const deleteMovimentacao = useCallback((id: string) => {
    setMovimentacoes(prev => prev.filter(mov => mov.id !== id));
  }, []);

  // Funções para Compras
  const addCompra = useCallback((compra: Compra) => {
    setCompras(prev => [...prev, compra]);
  }, []);

  // Função para processar entrega de compra e atualizar estoque
  const processarEntregaCompra = useCallback((compra: Compra) => {
    let totalItens = 0;
    
    // Atualizar estoque dos materiais
    compra.itens.forEach(item => {
      totalItens++;
      
      setMateriais(prev => prev.map(material => 
        material.id === item.materialId 
          ? { ...material, estoque: material.estoque + item.quantidade, updatedAt: new Date() }
          : material
      ));

      // Criar movimentação de entrada no estoque
      const novaMovimentacao: MovimentacaoEstoque = {
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        materialId: item.materialId,
        obraId: compra.obraId,
        tipo: 'entrada',
        quantidade: item.quantidade,
        motivo: `Entrega da compra ${compra.notaFiscal ? `(NF: ${compra.notaFiscal})` : `#${compra.id}`}`,
        data: new Date(),
        responsavel: 'Sistema - Entrega Automática',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMovimentacoes(prev => [...prev, novaMovimentacao]);
    });

    // Enviar notificação de sucesso
    if (notificationFunction) {
      notificationFunction({
        type: 'success',
        title: 'Compra Entregue',
        message: `Estoque atualizado automaticamente com ${totalItens} ${totalItens === 1 ? 'item' : 'itens'} da compra ${compra.notaFiscal ? `(NF: ${compra.notaFiscal})` : `#${compra.id}`}`,
        autoClose: true,
        duration: 6000,
      });
    }
  }, [notificationFunction]);

  const updateCompra = useCallback((id: string, compraData: Partial<Compra>) => {
    // Se a compra foi marcada como entregue, processar a entrega
    if (compraData.status === 'entregue') {
      setCompras(prev => {
        const compra = prev.find(c => c.id === id);
        if (compra && compra.status !== 'entregue') {
          processarEntregaCompra(compra);
        }
        return prev.map(compra => 
          compra.id === id ? { ...compra, ...compraData, updatedAt: new Date() } : compra
        );
      });
    } else {
      setCompras(prev => prev.map(compra => 
        compra.id === id ? { ...compra, ...compraData, updatedAt: new Date() } : compra
      ));
    }
  }, [processarEntregaCompra]);

  const deleteCompra = useCallback((id: string) => {
    setCompras(prev => prev.filter(compra => compra.id !== id));
  }, []);

  // Relacionamentos Obra-Etapas (useMemo para evitar recálculo desnecessário)
  const getEtapasByObra = useCallback((obraId: string): Etapa[] => {
    return etapas.filter(etapa => etapa.obraId === obraId);
  }, [etapas]);

  const getProgressoObra = useCallback((obraId: string): number => {
    const etapasObra = etapas.filter(etapa => etapa.obraId === obraId);
    if (etapasObra.length === 0) return 0;
    
    const somaProgresso = etapasObra.reduce((soma, etapa) => soma + etapa.progresso, 0);
    return Math.round(somaProgresso / etapasObra.length);
  }, [etapas]);

  const getEtapasCompletadas = useCallback((obraId: string): number => {
    const etapasObra = etapas.filter(etapa => etapa.obraId === obraId);
    return etapasObra.filter(etapa => etapa.progresso === 100).length;
  }, [etapas]);

  const getEtapasTotal = useCallback((obraId: string): number => {
    return etapas.filter(etapa => etapa.obraId === obraId).length;
  }, [etapas]);

  const getProximaEtapa = useCallback((obraId: string): Etapa | null => {
    const etapasObra = etapas
      .filter(etapa => etapa.obraId === obraId && etapa.progresso < 100)
      .sort((a, b) => {
        if (a.dataInicio && b.dataInicio) {
          return a.dataInicio.getTime() - b.dataInicio.getTime();
        }
        return 0;
      });
    
    return etapasObra[0] || null;
  }, [etapas]);

  const createEtapasTemplate = useCallback(async (obraId: string): Promise<void> => {
    const etapasTemplate = [
      {
        id: Date.now().toString(),
        nome: 'Fundação',
        descricao: 'Escavação e construção da fundação',
        obraId,
        progresso: 0,
        fotos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        nome: 'Estrutura',
        descricao: 'Construção da estrutura de concreto armado',
        obraId,
        progresso: 0,
        fotos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: (Date.now() + 2).toString(),
        nome: 'Alvenaria',
        descricao: 'Construção das paredes de alvenaria',
        obraId,
        progresso: 0,
        fotos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: (Date.now() + 3).toString(),
        nome: 'Acabamento',
        descricao: 'Pintura e acabamentos finais',
        obraId,
        progresso: 0,
        fotos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setEtapas(prev => [...prev, ...etapasTemplate]);
  }, []);

  // Memoizar o valor do contexto
  const value = useMemo<DataContextType>(() => ({
    // Obras
    obras,
    setObras,
    addObra,
    updateObra,
    deleteObra,
    
    // Etapas
    etapas,
    setEtapas,
    addEtapa,
    updateEtapa,
    deleteEtapa,
    
    // Relacionamentos Obra-Etapas
    getEtapasByObra,
    getProgressoObra,
    getEtapasCompletadas,
    getEtapasTotal,
    getProximaEtapa,
    createEtapasTemplate,
    
    // Materiais
    materiais,
    setMateriais,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    
    // Movimentações
    movimentacoes,
    setMovimentacoes,
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    
    // Compras
    compras,
    setCompras,
    addCompra,
    updateCompra,
    deleteCompra,

    // Estado
    isLoading,
    isHydrated,
    
    // Função para adicionar notificação
    setNotificationFunction,
  }), [
    obras, etapas, materiais, movimentacoes, compras, isLoading, isHydrated,
    addObra, updateObra, deleteObra,
    addEtapa, updateEtapa, deleteEtapa,
    getEtapasByObra, getProgressoObra, getEtapasCompletadas, getEtapasTotal, getProximaEtapa, createEtapasTemplate,
    addMaterial, updateMaterial, deleteMaterial,
    addMovimentacao, updateMovimentacao, deleteMovimentacao,
    addCompra, updateCompra, deleteCompra,
    setNotificationFunction,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Hook personalizado para conectar notificações
export function useDataWithNotifications() {
  const dataContext = useData();
  
  // Função para configurar notificações - deve ser chamada pelos componentes que têm acesso ao NotificationsContext
  const connectNotifications = useCallback((addNotification: NotificationFunction) => {
    dataContext.setNotificationFunction(addNotification);
  }, [dataContext]);

  return {
    ...dataContext,
    connectNotifications,
  };
} 