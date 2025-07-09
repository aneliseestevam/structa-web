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

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export class ReportService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  private filterData(data: ReportData) {
    const { filters } = data;
    const { dataInicio, dataFim, status } = filters;
    
    const filteredData = { ...data.data };
    
    // Filtrar por data
    if (dataInicio) {
      const startDate = new Date(dataInicio);
      filteredData.obras = filteredData.obras.filter(obra => obra.dataInicio >= startDate);
      filteredData.etapas = filteredData.etapas.filter(etapa => 
        etapa.dataInicio && etapa.dataInicio >= startDate
      );
      filteredData.compras = filteredData.compras.filter(compra => compra.dataCompra >= startDate);
      filteredData.movimentacoes = filteredData.movimentacoes.filter(mov => mov.data >= startDate);
    }
    
    if (dataFim) {
      const endDate = new Date(dataFim);
      filteredData.obras = filteredData.obras.filter(obra => 
        !obra.dataFim || obra.dataFim <= endDate
      );
      filteredData.etapas = filteredData.etapas.filter(etapa => 
        !etapa.dataFim || etapa.dataFim <= endDate
      );
      filteredData.compras = filteredData.compras.filter(compra => compra.dataCompra <= endDate);
      filteredData.movimentacoes = filteredData.movimentacoes.filter(mov => mov.data <= endDate);
    }
    
    // Filtrar por status
    if (status && status !== 'all') {
      filteredData.obras = filteredData.obras.filter(obra => obra.status === status);
      filteredData.compras = filteredData.compras.filter(compra => compra.status === status);
    }
    
    return filteredData;
  }

  async generatePDF(reportData: ReportData): Promise<void> {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const filteredData = this.filterData(reportData);
    
    // Título do relatório
    doc.setFontSize(20);
    doc.text('Relatório de Gestão de Obras', 20, 30);
    
    // Informações básicas
    doc.setFontSize(12);
    doc.text(`Tipo: ${reportData.type}`, 20, 50);
    doc.text(`Gerado em: ${this.formatDate(new Date())}`, 20, 60);
    
         const yPosition = 80;
     
     // Gerar conteúdo baseado no tipo
     switch (reportData.type) {
       case 'geral':
         await this.generateGeralPDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
       case 'custos':
         await this.generateCustosPDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
       case 'progresso':
         await this.generateProgressoPDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
       case 'produtividade':
         await this.generateProdutividadePDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
       case 'materiais':
         await this.generateMateriaisPDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
       case 'estoque':
         await this.generateEstoquePDF(doc, { ...reportData, data: filteredData }, yPosition);
         break;
     }
    
    // Salvar PDF
    doc.save(`relatorio_${reportData.type}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcel(reportData: ReportData): Promise<void> {
    const filteredData = this.filterData(reportData);
    const workbook = XLSX.utils.book_new();
    
    // Gerar planilhas baseadas no tipo
    switch (reportData.type) {
      case 'geral':
        this.generateGeralExcel(workbook, { ...reportData, data: filteredData });
        break;
      case 'custos':
        this.generateCustosExcel(workbook, { ...reportData, data: filteredData });
        break;
      case 'progresso':
        this.generateProgressoExcel(workbook, { ...reportData, data: filteredData });
        break;
      case 'produtividade':
        this.generateProdutividadeExcel(workbook, { ...reportData, data: filteredData });
        break;
      case 'materiais':
        this.generateMateriaisExcel(workbook, { ...reportData, data: filteredData });
        break;
      case 'estoque':
        this.generateEstoqueExcel(workbook, { ...reportData, data: filteredData });
        break;
    }
    
    // Salvar Excel
    XLSX.writeFile(workbook, `relatorio_${reportData.type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private async generateGeralPDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
    const { obras, etapas, materiais, compras } = data.data;
    
    doc.setFontSize(16);
    doc.text('Resumo Geral', 20, yPosition);
    yPosition += 15;
    
    // Estatísticas gerais
    const stats = [
      ['Total de Obras', obras.length.toString()],
      ['Total de Etapas', etapas.length.toString()],
      ['Total de Materiais', materiais.length.toString()],
      ['Total de Compras', compras.length.toString()],
      ['Custo Total', this.formatCurrency(compras.reduce((sum, c) => sum + c.custoTotal, 0))],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: stats,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // Resumo das obras
    if (obras.length > 0) {
      doc.setFontSize(14);
      doc.text('Resumo das Obras', 20, yPosition);
      yPosition += 10;
      
      const obrasData = obras.map(obra => [
        obra.nome,
        obra.status,
        this.formatDate(obra.dataInicio),
        obra.dataPrevisao ? this.formatDate(obra.dataPrevisao) : 'N/A',
        obra.responsavel,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'Status', 'Data Início', 'Data Previsão', 'Responsável']],
        body: obrasData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateCustosPDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
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
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateProgressoPDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
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
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateProdutividadePDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
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
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateMateriaisPDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
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
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    return yPosition;
  }

  private async generateEstoquePDF(doc: jsPDFWithAutoTable, data: ReportData, yPosition: number): Promise<number> {
    const { materiais, movimentacoes } = data.data;
    
    doc.setFontSize(16);
    doc.text('Análise de Estoque', 20, yPosition);
    yPosition += 15;
    
    // Status do estoque
    const estoqueStatus = materiais.map(material => {
      const entradas = movimentacoes
        .filter(mov => mov.materialId === material.id && mov.tipo === 'entrada')
        .reduce((sum, mov) => sum + mov.quantidade, 0);
      
      const saidas = movimentacoes
        .filter(mov => mov.materialId === material.id && mov.tipo === 'saida')
        .reduce((sum, mov) => sum + mov.quantidade, 0);
      
      const saldo = entradas - saidas;
      const status = saldo <= material.estoqueMinimo ? 'Crítico' : 'Normal';
      
      return {
        material: material.nome,
        estoqueMinimo: material.estoqueMinimo,
        entradas,
        saidas,
        saldo,
        status,
      };
    });
    
    if (estoqueStatus.length > 0) {
      const estoqueData = estoqueStatus.map(item => [
        item.material,
        item.estoqueMinimo.toString(),
        item.entradas.toString(),
        item.saidas.toString(),
        item.saldo.toString(),
        item.status,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Material', 'Estoque Mín.', 'Entradas', 'Saídas', 'Saldo', 'Status']],
        body: estoqueData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
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