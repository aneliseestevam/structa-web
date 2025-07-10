export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'engineer' | 'manager';
  createdAt: Date;
  updatedAt: Date;
}

export interface Obra {
  id: string;
  nome: string;
  local: string;
  dataInicio: Date;
  dataFim?: Date;
  dataPrevisao: Date;
  responsavel: string;
  status: 'planejada' | 'em-andamento' | 'finalizada';
  orcamento?: number;
  custoTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Etapa {
  id: string;
  nome: string;
  descricao: string;
  obraId: string;
  obra?: Obra;
  progresso: number; // 0-100
  dataInicio?: Date;
  dataFim?: Date;
  fotos: string[];
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  nome: string;
  unidade: string;
  fornecedor: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMinimo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Compra {
  id: string;
  obraId: string;
  obra?: Obra;
  fornecedor: string;
  dataCompra: Date;
  custoTotal: number;
  notaFiscal?: string;
  status: 'pendente' | 'aprovada' | 'entregue';
  itens: CompraItem[];
  processedAt?: Date; // Data de processamento da entrega
  createdAt: Date;
  updatedAt: Date;
}

export interface CompraItem {
  id: string;
  compraId: string;
  materialId: string;
  material?: Material;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

export interface MovimentacaoEstoque {
  id: string;
  materialId: string;
  material?: Material;
  obraId: string;
  obra?: Obra;
  etapaId?: string;
  etapa?: Etapa;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  data: Date;
  responsavel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardKPIs {
  totalObras: number;
  obrasEmAndamento: number;
  obrasFinalizadas: number;
  gastoTotal: number;
  materiaisComEstoqueBaixo: number;
  etapasCompletadas: number;
  etapasTotal: number;
  progressoMedio: number;
}

export interface GastosPorEtapa {
  etapa: string;
  valor: number;
  obra: string;
}

export interface MaterialMaisConsumido {
  material: string;
  quantidade: number;
  valor: number;
}

export interface EvolucaoObra {
  data: string;
  progresso: number;
  obra: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 