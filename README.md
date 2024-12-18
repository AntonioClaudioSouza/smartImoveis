# SmartImoveis
**Resumo do Contrato Inteligente "SmartImoveis"**

**Objetivo:**
O contrato inteligente **SmartImoveis** permite o gerenciamento de aluguel de imóveis por meio de tokenização (utilizando NFTs ERC-721) e transações com tokens ERC-20 para pagamentos de aluguéis e multas. O sistema é projetado para três tipos de participantes: **Proprietários**, **Locatários** e **Vistoriadores**, com uma taxa administrativa para o administrador da plataforma, que é aplicada a cada transação de aluguel ou pagamento de multa.

---

**Componentes Principais:**

**NFTs (ERC-721):**

- Cada imóvel é representado por um **NFT (ERC-721)** com identificador único e URI associada (metadados do imóvel).
- Os imóveis podem ser **adicionados, alugados e gerenciados** através desse NFT.

**Papéis e Acessos:**

- **Admin**: Controla a plataforma, gerencia proprietários, locatários e vistoriadores. Recebe uma taxa administrativa sobre as transações.
- **Proprietário**: Cadastra imóveis, aluga-os, solicita o encerramento de contratos e recebe o pagamento do aluguel.
- **Locatário**: Aluga imóveis, paga aluguéis, solicita o encerramento do contrato e paga multas, se necessário.
- **Vistoriador**: Realiza a vistoria dos imóveis e aplica multas, se o imóvel não passar na vistoria.

**Taxa Administrativa:**

- O **Administrador da plataforma** recebe uma taxa de **1%** (configurável) de cada pagamento de aluguel ou multa.
- A taxa administrativa é configurável, mas limitada a no máximo **10%** do valor da transação.

---

**Principais Funções:**

- **Gestão de Imóveis**:
    - `adicionarImovel`: Proprietário adiciona um imóvel, definindo o aluguel mensal e a URI.
    - `alugarImovel`: Locatário aluga um imóvel, com vencimento do aluguel definido em 30 dias após o aluguel.
- **Encerramento do Contrato**:
    - `solicitarEncerramento`: Locatário ou proprietário podem solicitar o encerramento do contrato.
    - `realizarVistoria`: Vistoriador decide se o imóvel passou ou não na vistoria. Se necessário, aplica uma multa de 300% do valor do aluguel.
    - `pagarMulta`: Locatário paga a multa, caso o imóvel não tenha passado na vistoria.
    - `confirmarEncerramento`: Após vistoria e pagamento da multa (se necessário), o contrato é encerrado.
- **Pagamentos**:
    - `pagarAluguel`: Locatário paga o aluguel mensal em tokens ERC-20. O administrador recebe 1% da transação como taxa.
    - `pagarMulta`: Locatário paga a multa se o imóvel não passar na vistoria, com a taxa administrativa também sendo aplicada.
- **Gestão de Papéis (Access Control)**:
    - `adicionarProprietario`: Admin pode adicionar um novo proprietário.
    - `removerProprietario`: Admin pode remover um proprietário.
    - `adicionarVistoriador`: Admin pode adicionar um vistoriador.
    - `removerVistoriador`: Admin pode remover um vistoriador.
    - `definirTaxaPlataforma`: Admin configura a taxa administrativa (limitada a 10%).

---

**Eventos Importantes:**

- `ImovelAdicionado`: Emitido quando um imóvel é adicionado.
- `ImovelAlugado`: Emitido quando um imóvel é alugado.
- `AluguelPago`: Emitido quando o aluguel é pago.
- `TaxaPlataformaEnviada`: Emitido quando a taxa administrativa é transferida.
- `SolicitacaoEncerramento`: Emitido quando o encerramento do contrato é solicitado.
- `VistoriaConcluida`: Emitido quando a vistoria é concluída.
- `MultaAplicada`: Emitido quando uma multa é aplicada.
- `MultaPaga`: Emitido quando a multa é paga.
- `EncerramentoConfirmado`: Emitido quando o contrato de locação é encerrado.

---

**Fluxo de Trabalho:**

1. **Cadastro de Proprietários e Locatários**:
    - O Admin adiciona proprietários e vistoriadores à plataforma.
    - O proprietário cadastra imóveis, define aluguéis e fornece URI para metadados.
2. **Processo de Locação**:
    - O locatário visualiza imóveis disponíveis e pode alugá-los por 30 dias.
    - O aluguel é pago em tokens ERC-20, com 1% destinado à plataforma.
3. **Encerramento de Contrato**:
    - Locatário ou proprietário solicita o encerramento.
    - O vistoriador realiza a vistoria e, caso necessário, aplica uma multa.
    - O locatário paga a multa (se necessário) e o contrato é encerrado.
4. **Taxa Administrativa**:
    - O Admin recebe 1% de cada pagamento de aluguel ou multa.