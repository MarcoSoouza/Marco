# TODO - Adicionar opção para baixar relatório de estoque

## Informações Coletadas:
- admin.html contém a seção de Estoque com tabela de produtos
- A tabela tem colunas: Produto, Categoria, Quantidade, Unidade, Custo Unit., Status, Ações
- admin.js gerencia todas as funções de estoque incluindo salvar/carregar do localStorage

## Plano:
- [ ] Adicionar botão "Baixar Relatório" no cabeçalho da seção de estoque em admin.html
- [ ] Criar função `baixarRelatorioEstoque()` em admin.js que:
  - Obtém todos os produtos do localStorage
  - Gera um relatório formatado em CSV
  - Inicia o download do arquivo

## Arquivos Dependentes:
- admin.html (adicionar botão)
- admin.js (adicionar função de exportação)

## Passos de Follow-up:
- Testar a funcionalidade de download
