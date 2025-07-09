import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Obra, Etapa, Material, MovimentacaoEstoque, Compra } from '@/types';

interface ReportData {
  type: 'custos' | 'progresso' | 'produtividade' | 'materiais' | 'estoque' | 'geral';
  filters: {
    dataInicio: string;
    dataFim: string;
    obraId: string;
    status: string;
  };
  data: {
    obras: Obra[];
    etapas: Etapa[];
    materiais: Material[];
    movimentacoes: MovimentacaoEstoque[];
    compras: Compra[];
  };
}

export class ReportService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  private filterData(data: ReportData) {
    const { filters } = data;
    let filteredObras = data.data.obras;
    let filteredEtapas = data.data.etapas;
    let filteredCompras = data.data.compras;
    let filteredMovimentacoes = data.data.movimentacoes;

    // Filtrar por data
    if (filters.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      filteredObras = filteredObras.filter(obra => obra.dataInicio >= startDate);
      filteredEtapas = filteredEtapas.filter(etapa => 
        etapa.dataInicio ? etapa.dataInicio >= startDate : true
      );
      filteredCompras = filteredCompras.filter(compra => compra.dataCompra >= startDate);
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => mov.data >= startDate);
    }

    if (filters.dataFim) {
      const endDate = new Date(filters.dataFim);
      filteredObras = filteredObras.filter(obra => 
        obra.dataFim ? obra.dataFim <= endDate : obra.dataPrevisao <= endDate
      );
      filteredEtapas = filteredEtapas.filter(etapa => 
        etapa.dataFim ? etapa.dataFim <= endDate : true
      );
      filteredCompras = filteredCompras.filter(compra => compra.dataCompra <= endDate);
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => mov.data <= endDate);
    }

    // Filtrar por obra
    if (filters.obraId) {
      filteredObras = filteredObras.filter(obra => obra.id === filters.obraId);
      filteredEtapas = filteredEtapas.filter(etapa => etapa.obraId === filters.obraId);
      filteredCompras = filteredCompras.filter(compra => compra.obraId === filters.obraId);
    }

    // Filtrar por status
    if (filters.status) {
      filteredObras = filteredObras.filter(obra => obra.status === filters.status);
    }

    return {
      ...data,
      data: {
        ...data.data,
        obras: filteredObras,
        etapas: filteredEtapas,
        compras: filteredCompras,
        movimentacoes: filteredMovimentacoes,
      }
    };
  }

  async generatePDF(reportData: ReportData): Promise<void> {
    const filteredData = this.filterData(reportData);
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório Structa', 20, 20);
    
    // Subtítulo
    doc.setFontSize(14);
    const reportTitles = {
      geral: 'Relatório Geral',
      custos: 'Relatório de Custos',
      progresso: 'Relatório de Progresso',
      produtividade: 'Relatório de Produtividade',
      materiais: 'Relatório de Materiais',
      estoque: 'Relatório de Estoque',
    };
    doc.text(reportTitles[reportData.type], 20, 30);
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${this.formatDate(new Date())}`, 20, 40);
    
    const yPosition = 50;

    switch (reportData.type) {
      case 'geral':
        await this.generateGeralPDF(doc, filteredData, yPosition);
        break;
      case 'custos':
        await this.generateCustosPDF(doc, filteredData, yPosition);
        break;
      case 'progresso':
        await this.generateProgressoPDF(doc, filteredData, yPosition);
        break;
      case 'produtividade':
        await this.generateProdutividadePDF(doc, filteredData, yPosition);
        break;
      case 'materiais':
        await this.generateMateriaisPDF(doc, filteredData, yPosition);
        break;
      case 'estoque':
        await this.generateEstoquePDF(doc, filteredData, yPosition);
        break;
    }

    // Salvar o PDF
    doc.save(`relatorio-${reportData.type}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcel(reportData: ReportData): Promise<void> {
    const filteredData = this.filterData(reportData);
    const workbook = XLSX.utils.book_new();

    switch (reportData.type) {
      case 'geral':
        this.generateGeralExcel(workbook, filteredData);
        break;
      case 'custos':
        this.generateCustosExcel(workbook, filteredData);
        break;
      case 'progresso':
        this.generateProgressoExcel(workbook, filteredData);
        break;
      case 'produtividade':
        this.generateProdutividadeExcel(workbook, filteredData);
        break;
      case 'materiais':
        this.generateMateriaisExcel(workbook, filteredData);
        break;
      case 'estoque':
        this.generateEstoqueExcel(workbook, filteredData);
        break;
    }

    // Salvar o Excel
    XLSX.writeFile(workbook, `relatorio-${reportData.type}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private async generateGeralPDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { obras, etapas, materiais, compras } = data.data;
    
    // Resumo geral
    doc.setFontSize(16);
    doc.text('Resumo Geral', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Total de Obras: ${obras.length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Obras Ativas: ${obras.filter(o => o.status === 'em-andamento').length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Obras Finalizadas: ${obras.filter(o => o.status === 'finalizada').length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total de Etapas: ${etapas.length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total de Materiais: ${materiais.length}`, 20, yPosition);
    yPosition += 8;
    
    const totalCustos = compras.reduce((sum, compra) => sum + compra.custoTotal, 0);
    doc.text(`Custos Totais: ${this.formatCurrency(totalCustos)}`, 20, yPosition);
    yPosition += 20;
    
    // Tabela de obras
    if (obras.length > 0) {
      doc.setFontSize(14);
      doc.text('Obras', 20, yPosition);
      yPosition += 10;
      
      const obrasData = obras.map(obra => [
        obra.nome,
        obra.local,
        this.formatDate(obra.dataInicio),
        obra.status,
        this.formatCurrency(obra.orcamento || 0),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'Local', 'Data Início', 'Status', 'Orçamento']],
        body: obrasData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateCustosPDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { obras, compras } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Custos', 20, yPosition);
    yPosition += 15;
    
    // Custos por obra
    const custosPorObra = obras.map(obra => {
      const comprasObra = compras.filter(c => c.obraId === obra.id);
      const custoTotal = comprasObra.reduce((sum, compra) => sum + compra.custoTotal, 0);
      return {
        obra: obra.nome,
        orcamento: obra.orcamento || 0,
        custoAtual: custoTotal,
        diferenca: (obra.orcamento || 0) - custoTotal,
      };
    });
    
    if (custosPorObra.length > 0) {
      const custosData = custosPorObra.map(item => [
        item.obra,
        this.formatCurrency(item.orcamento),
        this.formatCurrency(item.custoAtual),
        this.formatCurrency(item.diferenca),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Obra', 'Orçamento', 'Custo Atual', 'Diferença']],
        body: custosData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateProgressoPDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { obras, etapas } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Progresso', 20, yPosition);
    yPosition += 15;
    
    // Progresso por obra
    const progressoPorObra = obras.map(obra => {
      const etapasObra = etapas.filter(e => e.obraId === obra.id);
      const progressoMedio = etapasObra.length > 0 
        ? etapasObra.reduce((sum, etapa) => sum + etapa.progresso, 0) / etapasObra.length 
        : 0;
      
      return {
        obra: obra.nome,
        totalEtapas: etapasObra.length,
        etapasCompletas: etapasObra.filter(e => e.progresso === 100).length,
        progressoMedio: Math.round(progressoMedio),
      };
    });
    
    if (progressoPorObra.length > 0) {
      const progressoData = progressoPorObra.map(item => [
        item.obra,
        item.totalEtapas.toString(),
        item.etapasCompletas.toString(),
        `${item.progressoMedio}%`,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Obra', 'Total Etapas', 'Etapas Completas', 'Progresso Médio']],
        body: progressoData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateProdutividadePDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { obras, etapas } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Produtividade', 20, yPosition);
    yPosition += 15;
    
    // Produtividade por obra
    const produtividadePorObra = obras.map(obra => {
      const etapasObra = etapas.filter(e => e.obraId === obra.id);
      const etapasCompletas = etapasObra.filter(e => e.progresso === 100);
      
      const diasDecorridos = Math.floor(
        (new Date().getTime() - obra.dataInicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const produtividade = diasDecorridos > 0 
        ? (etapasCompletas.length / diasDecorridos * 30).toFixed(2) 
        : '0.00';
      
      return {
        obra: obra.nome,
        diasDecorridos,
        etapasCompletas: etapasCompletas.length,
        produtividade: `${produtividade} etapas/mês`,
      };
    });
    
    if (produtividadePorObra.length > 0) {
      const produtividadeData = produtividadePorObra.map(item => [
        item.obra,
        item.diasDecorridos.toString(),
        item.etapasCompletas.toString(),
        item.produtividade,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Obra', 'Dias Decorridos', 'Etapas Completas', 'Produtividade']],
        body: produtividadeData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateMateriaisPDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { materiais, compras } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Materiais', 20, yPosition);
    yPosition += 15;
    
    // Materiais mais utilizados
    const materiaisUtilizados = materiais.map(material => {
      const comprasDoMaterial = compras.flatMap(compra => 
        compra.itens?.filter(item => item.materialId === material.id) || []
      );
      
      const quantidadeTotal = comprasDoMaterial.reduce((sum, item) => sum + item.quantidade, 0);
      const valorTotal = comprasDoMaterial.reduce((sum, item) => sum + item.precoTotal, 0);
      
      return {
        material: material.nome,
        unidade: material.unidade,
        quantidadeTotal,
        valorTotal,
        estoqueAtual: material.estoque || 0,
      };
    });
    
    if (materiaisUtilizados.length > 0) {
      const materiaisData = materiaisUtilizados.map(item => [
        item.material,
        item.unidade,
        item.quantidadeTotal.toString(),
        this.formatCurrency(item.valorTotal),
        item.estoqueAtual.toString(),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Material', 'Unidade', 'Qtd. Total', 'Valor Total', 'Estoque Atual']],
        body: materiaisData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateEstoquePDF(doc: jsPDF, data: ReportData, yPosition: number): Promise<number> {
    const { materiais, movimentacoes } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Estoque', 20, yPosition);
    yPosition += 15;
    
    // Status do estoque
    const statusEstoque = materiais.map(material => {
      const movimentacoesMaterial = movimentacoes.filter(m => m.materialId === material.id);
      const ultimaMovimentacao = movimentacoesMaterial.sort((a, b) => 
        b.data.getTime() - a.data.getTime()
      )[0];
      
      return {
        material: material.nome,
        estoqueAtual: material.estoque || 0,
        estoqueMinimo: material.estoqueMinimo || 0,
        status: (material.estoque || 0) <= (material.estoqueMinimo || 0) ? 'Baixo' : 'Normal',
        ultimaMovimentacao: ultimaMovimentacao ? this.formatDate(ultimaMovimentacao.data) : 'N/A',
      };
    });
    
    if (statusEstoque.length > 0) {
      const estoqueData = statusEstoque.map(item => [
        item.material,
        item.estoqueAtual.toString(),
        item.estoqueMinimo.toString(),
        item.status,
        item.ultimaMovimentacao,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Material', 'Estoque Atual', 'Estoque Mínimo', 'Status', 'Última Movimentação']],
        body: estoqueData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private generateGeralExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { obras, etapas, materiais, compras } = data.data;
    
    // Aba de resumo
    const resumoData = [
      ['Métrica', 'Valor'],
      ['Total de Obras', obras.length],
      ['Obras Ativas', obras.filter(o => o.status === 'em-andamento').length],
      ['Obras Finalizadas', obras.filter(o => o.status === 'finalizada').length],
      ['Total de Etapas', etapas.length],
      ['Total de Materiais', materiais.length],
      ['Custos Totais', compras.reduce((sum, compra) => sum + compra.custoTotal, 0)],
    ];
    
    const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');
    
    // Aba de obras
    if (obras.length > 0) {
      const obrasData = [
        ['Nome', 'Local', 'Data Início', 'Data Previsão', 'Status', 'Orçamento', 'Custo Total'],
        ...obras.map(obra => [
          obra.nome,
          obra.local,
          this.formatDate(obra.dataInicio),
          this.formatDate(obra.dataPrevisao),
          obra.status,
          obra.orcamento || 0,
          obra.custoTotal || 0,
        ])
      ];
      
      const obrasSheet = XLSX.utils.aoa_to_sheet(obrasData);
      XLSX.utils.book_append_sheet(workbook, obrasSheet, 'Obras');
    }
  }

  private generateCustosExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { obras, compras } = data.data;
    
    const custosData = [
      ['Obra', 'Orçamento', 'Custo Atual', 'Diferença', 'Percentual Usado'],
      ...obras.map(obra => {
        const comprasObra = compras.filter(c => c.obraId === obra.id);
        const custoTotal = comprasObra.reduce((sum, compra) => sum + compra.custoTotal, 0);
        const orcamento = obra.orcamento || 0;
        const diferenca = orcamento - custoTotal;
        const percentualUsado = orcamento > 0 ? (custoTotal / orcamento * 100).toFixed(2) : '0.00';
        
        return [
          obra.nome,
          orcamento,
          custoTotal,
          diferenca,
          `${percentualUsado}%`,
        ];
      })
    ];
    
    const custosSheet = XLSX.utils.aoa_to_sheet(custosData);
    XLSX.utils.book_append_sheet(workbook, custosSheet, 'Custos');
  }

  private generateProgressoExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { obras, etapas } = data.data;
    
    const progressoData = [
      ['Obra', 'Total Etapas', 'Etapas Completas', 'Progresso Médio', 'Status'],
      ...obras.map(obra => {
        const etapasObra = etapas.filter(e => e.obraId === obra.id);
        const etapasCompletas = etapasObra.filter(e => e.progresso === 100);
        const progressoMedio = etapasObra.length > 0 
          ? etapasObra.reduce((sum, etapa) => sum + etapa.progresso, 0) / etapasObra.length 
          : 0;
        
        return [
          obra.nome,
          etapasObra.length,
          etapasCompletas.length,
          `${Math.round(progressoMedio)}%`,
          obra.status,
        ];
      })
    ];
    
    const progressoSheet = XLSX.utils.aoa_to_sheet(progressoData);
    XLSX.utils.book_append_sheet(workbook, progressoSheet, 'Progresso');
  }

  private generateProdutividadeExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { obras, etapas } = data.data;
    
    const produtividadeData = [
      ['Obra', 'Dias Decorridos', 'Etapas Completas', 'Produtividade (etapas/mês)'],
      ...obras.map(obra => {
        const etapasObra = etapas.filter(e => e.obraId === obra.id);
        const etapasCompletas = etapasObra.filter(e => e.progresso === 100);
        
        const diasDecorridos = Math.floor(
          (new Date().getTime() - obra.dataInicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const produtividade = diasDecorridos > 0 
          ? (etapasCompletas.length / diasDecorridos * 30).toFixed(2) 
          : '0.00';
        
        return [
          obra.nome,
          diasDecorridos,
          etapasCompletas.length,
          produtividade,
        ];
      })
    ];
    
    const produtividadeSheet = XLSX.utils.aoa_to_sheet(produtividadeData);
    XLSX.utils.book_append_sheet(workbook, produtividadeSheet, 'Produtividade');
  }

  private generateMateriaisExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { materiais, compras } = data.data;
    
    const materiaisData = [
      ['Material', 'Unidade', 'Quantidade Total Comprada', 'Valor Total', 'Estoque Atual'],
      ...materiais.map(material => {
        const comprasDoMaterial = compras.flatMap(compra => 
          compra.itens?.filter(item => item.materialId === material.id) || []
        );
        
        const quantidadeTotal = comprasDoMaterial.reduce((sum, item) => sum + item.quantidade, 0);
        const valorTotal = comprasDoMaterial.reduce((sum, item) => sum + item.precoTotal, 0);
        
        return [
          material.nome,
          material.unidade,
          quantidadeTotal,
          valorTotal,
          material.estoque || 0,
        ];
      })
    ];
    
    const materiaisSheet = XLSX.utils.aoa_to_sheet(materiaisData);
    XLSX.utils.book_append_sheet(workbook, materiaisSheet, 'Materiais');
  }

  private generateEstoqueExcel(workbook: XLSX.WorkBook, data: ReportData): void {
    const { materiais, movimentacoes } = data.data;
    
    const estoqueData = [
      ['Material', 'Estoque Atual', 'Estoque Mínimo', 'Status', 'Última Movimentação'],
      ...materiais.map(material => {
        const movimentacoesMaterial = movimentacoes.filter(m => m.materialId === material.id);
        const ultimaMovimentacao = movimentacoesMaterial.sort((a, b) => 
          b.data.getTime() - a.data.getTime()
        )[0];
        
        return [
          material.nome,
          material.estoque || 0,
          material.estoqueMinimo || 0,
          (material.estoque || 0) <= (material.estoqueMinimo || 0) ? 'Baixo' : 'Normal',
          ultimaMovimentacao ? this.formatDate(ultimaMovimentacao.data) : 'N/A',
        ];
      })
    ];
    
    const estoqueSheet = XLSX.utils.aoa_to_sheet(estoqueData);
    XLSX.utils.book_append_sheet(workbook, estoqueSheet, 'Estoque');
  }
} 