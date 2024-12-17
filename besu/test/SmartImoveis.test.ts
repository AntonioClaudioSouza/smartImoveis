import { expect } from "chai";
import { ethers } from "hardhat";
import { BRLToken, SmartImoveis } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";

describe("SmartImoveis Contract", function () {
  let brlTokenInstance: BRLToken;
  let SmartTokenInstance: SmartImoveis;
  let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress;

  beforeEach(async function () {
    // Pegando os signatários
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Implantar o contrato BRLToken (ERC20)
    const BRLTokenContract = await ethers.getContractFactory("BRLToken");
    brlTokenInstance = await BRLTokenContract.deploy(owner.address);
    
    // Implantar o contrato SmartImoveis
    const SmartTokenContract = await ethers.getContractFactory("SmartImoveis");
    SmartTokenInstance = await SmartTokenContract.deploy(await brlTokenInstance.getAddress());
    
    // Verificar se o contrato foi implantado corretamente
    expect(await SmartTokenInstance.getAddress()).to.not.be.null;
  });

  describe("Taxa de locação da Plataforma", function () {
    it("Deve permitir que o admin defina a taxa de locacação da plataforma", async function () {
      const novaTaxa = 200; // Exemplo de 2%
      await SmartTokenInstance.setTaxaLocacao(novaTaxa);

      const taxa = await SmartTokenInstance.getTaxaLocacao();
      expect(taxa).to.equal(novaTaxa);
    });

    it("Não deve permitir que o admin defina uma taxa acima do limite máximo de 10%", async function () {
      const taxaAlta = 1200; // 12%
      await expect(SmartTokenInstance.setTaxaLocacao(taxaAlta))
        .to.be.revertedWith("Taxa nao pode exceder o limite maximo de 10%");
    });

    it("Não deve permitir que um endereço sem a role ADMIN defina a taxa de locação da plataforma", async function () {
        const novaTaxa = 500; // 5%
        try {
          await SmartTokenInstance.connect(addr1 as unknown as Signer).setTaxaLocacao(novaTaxa);
          // Se não falhar, devemos forçar uma falha no teste
          expect.fail("A transação deveria ter revertido");
        } catch (error: any) {
          // Verificando se o erro contém a string relevante do OpenZeppelin
          expect(error.message).to.include("AccessControlUnauthorizedAccount");
        }
      });
  });

  describe("Locatários", function () {
    it("Deve permitir que o admin adicione um locatário", async function () {
      await SmartTokenInstance.adicionarLocatario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr1.getAddress())).to.be.true;
    });

    it("Deve permitir que o admin remova um locatário", async function () {
      // Adicionando um locatário
      await SmartTokenInstance.adicionarLocatario(await addr1.getAddress());
      
      // Removendo o locatário
      await SmartTokenInstance.removerLocatario(await addr1.getAddress());
      
      // Verificando se o locatário foi removido
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr1.getAddress())).to.be.false;
    });

    it("Não deve permitir adicionar um locatário já existente", async function () {
      // Adicionando um locatário pela primeira vez
      await SmartTokenInstance.adicionarLocatario(await addr1.getAddress());

      // Tentando adicionar o locatário novamente
      await expect(SmartTokenInstance.adicionarLocatario(await addr1.getAddress())).to.be.revertedWith("O locatario ja definido");
    });

    it("Não deve permitir remover um locatário não existente", async function () {
      // Tentando remover um locatário que não foi adicionado
      await expect(SmartTokenInstance.removerLocatario(await addr1.getAddress())).to.be.revertedWith("O endereco nao e um locatario.");
    });
  });

  describe("Proprietários", function () {
    it("Deve permitir que o admin adicione um proprietário", async function () {
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;
    });

    it("Deve permitir que o admin remova um proprietário", async function () {
      // Adicionando um proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      
      // Removendo o proprietário
      await SmartTokenInstance.removerProprietario(await addr1.getAddress());
      
      // Verificando se o proprietário foi removido
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.false;
    });

    it("Não deve permitir adicionar um proprietário já existente", async function () {
      // Adicionando um proprietário pela primeira vez
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());

      // Tentando adicionar o proprietário novamente
      await expect(SmartTokenInstance.adicionarProprietario(await addr1.getAddress())).to.be.revertedWith("proprietario ja definido");
    });

    it("Não deve permitir remover um proprietário não existente", async function () {
      // Tentando remover um proprietário que não foi adicionado
      await expect(SmartTokenInstance.removerProprietario(await addr1.getAddress())).to.be.revertedWith("O endereco nao e um proprietario.");
    });
  });

  describe("Vistoriadores", function () {
    it("Deve permitir que o admin adicione um vistoriador", async function () {
      await SmartTokenInstance.adicionarVistoriador(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.VISTORIADOR_ROLE(), await addr2.getAddress())).to.be.true;
    });

    it("Deve permitir que o admin remova um vistoriador", async function () {
      // Adicionando um vistoriador
      await SmartTokenInstance.adicionarVistoriador(await addr2.getAddress());
      
      // Removendo o vistoriador
      await SmartTokenInstance.removerVistoriador(await addr2.getAddress());
      
      // Verificando se o vistoriador foi removido
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.VISTORIADOR_ROLE(), await addr2.getAddress())).to.be.false;
    });

    it("Não deve permitir adicionar um vistoriador já existente", async function () {
      // Adicionando um vistoriador pela primeira vez
      await SmartTokenInstance.adicionarVistoriador(await addr2.getAddress());

      // Tentando adicionar o vistoriador novamente
      await expect(SmartTokenInstance.adicionarVistoriador(await addr2.getAddress())).to.be.revertedWith("O vistoriador ja definido");
    });

    it("Não deve permitir remover um vistoriador não existente", async function () {
      // Tentando remover um vistoriador que não foi adicionado
      await expect(SmartTokenInstance.removerVistoriador(await addr2.getAddress())).to.be.revertedWith("O endereco nao e um vistoriador.");
    });
  });

  describe("Função adicionarImovel", function () {      
    it("Deve permitir que um proprietário adicione um imóvel", async function () {
     
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;
      
      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      const tx = await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAdicionado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr1.getAddress(),
        aluguelMensal,
        taxaMulta,
        uri
      );

      // Verificar se o imóvel foi adicionado corretamente
      const imovel = await SmartTokenInstance.getImovel(1);
      expect(imovel.id).to.equal(1);
      expect(imovel.proprietario).to.equal(await addr1.getAddress());
      expect(imovel.valorLocacao).to.equal(aluguelMensal);
      expect(imovel.taxaMulta).to.equal(taxaMulta);
    });
   
    it("Não deve permitir que um endereço sem a role PROPRIETARIO_ROLE adicione um imóvel", async function () {
      await SmartTokenInstance.adicionarLocatario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr1.getAddress())).to.be.true;

      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";
      
      await expect(
        SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri)
      ).to.be.revertedWithCustomError(SmartTokenInstance, "AccessControlUnauthorizedAccount");
    });
   
    it("Não deve permitir adicionar um imóvel com aluguel mensal igual a 0", async function () {
    
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      const aluguelMensal = 0;
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";
  
      await expect(
        SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri)
      ).to.be.revertedWith("Valor do aluguel deve ser maior que zero");
    });
 
    it("Deve incrementar corretamente o ID do próximo imóvel", async function () {
      
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri1 = "https://example.com/imovel/1";
      const uri2 = "https://example.com/imovel/2";
  
      // Adicionar o primeiro imóvel
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri1);
  
      // Adicionar o segundo imóvel
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri2);
  
      // Verificar IDs dos imóveis
      const imovel1 = await SmartTokenInstance.getImovel(1);
      const imovel2 = await SmartTokenInstance.getImovel(2);
      expect(imovel1.id).to.equal(1);
      expect(imovel2.id).to.equal(2);
    });
  });

  describe("Função alugarImovel", function () {
    it("Não deve permitir alugar um imóvel que não existe", async function () {

      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;
            
      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";
      
      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 0;
      await expect(
        SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel)
      ).to.be.revertedWith("Imovel nao existe");
    }
    );

    it("Não deve permitir alugar um imóvel para um locatário que não existe", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      await expect(
        SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel)
      ).to.be.revertedWithCustomError(SmartTokenInstance, "AccessControlUnauthorizedAccount");
    }
    );

    it("Deve permitir alugar um imóvel para um locatário", async function () {
      
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(1);
      expect(imovel.locatario).to.equal(await addr2.getAddress());
    }
    );
  });

  describe("Deve permitir que um locatário pague o aluguel", function () {
    it("Deve permitir que um locatário pague o aluguel", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;
      
      const taxaLocacao = 1000; // 10%
      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // added taxa de locação da plataforma
      await SmartTokenInstance.setTaxaLocacao(taxaLocacao); // 10%

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        idImovel,
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(idImovel);
      expect(imovel.locatario).to.equal(await addr2.getAddress());

      // Adicionar BRL ao locatário      
      const mintAmount = 2000;
      await brlTokenInstance.mint(await addr2.getAddress(), mintAmount);
      expect(await brlTokenInstance.balanceOf(await addr2.getAddress())).to.equal(mintAmount * 10 ** 2);
      
      // Aprovar o contrato SmartImoveis a gastar BRL
      await brlTokenInstance.connect(addr2 as unknown as Signer).approve(await SmartTokenInstance.getAddress(), mintAmount * 10 ** 2);      
      expect(await brlTokenInstance.allowance(await addr2.getAddress(), await SmartTokenInstance.getAddress())).to
        .equal(mintAmount * 10 ** 2);

      // Pagar o aluguel
      const txPagarAluguel = await SmartTokenInstance.connect(addr2 as unknown as Signer).pagarAluguel(idImovel);
      
      // Verificar evento emitido de aluguel pago
      await expect(txPagarAluguel).to.emit(SmartTokenInstance, "AluguelPago").withArgs(
        idImovel, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
        aluguelMensal
        );

      // Verificar o evento de taxa de locação paga
      const taxaPlataforma = (aluguelMensal * taxaLocacao) / 10000;
      await expect(txPagarAluguel).to.emit(SmartTokenInstance, "TaxaPlataformaEnviada").withArgs(
        idImovel, // ID do imóvel (primeiro imóvel criado)
        taxaPlataforma,
      );
    });
  });

  describe("Encerramento de contrato", function () {
    it("Não deve permitir que um endereço sem a role LOCATARIO_ROLE solicite encerramento", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 1000*10 ** 2;//1000,00
      const taxaMulta = 10*10 ** 2; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(1);
      expect(imovel.locatario).to.equal(await addr2.getAddress());

      await expect(
        SmartTokenInstance.connect(addr3 as unknown as Signer).solicitarEncerramentoLocatario(idImovel)
      ).to.be.revertedWithCustomError(SmartTokenInstance, "AccessControlUnauthorizedAccount");
    });

    it("Não deve permitir solicitação LOCATÁRIO para imóvel não alugado", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 1000*10 ** 2;//1000,00
      const taxaMulta = 10*10 ** 2; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const imovel = 1
      await expect(
        SmartTokenInstance.connect(addr2 as unknown as Signer).solicitarEncerramentoLocatario(imovel)
      ).to.be.revertedWith("Imovel nao alugado");
    });

    it("Deve permitir que um LOCATÁRIO solicite encerramento do contrato", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 1000*10 ** 2;//1000,00
      const taxaMulta = 10*10 ** 2; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(1);
      expect(imovel.locatario).to.equal(await addr2.getAddress());

      const txEncerramento = await SmartTokenInstance.connect(addr2 as unknown as Signer).solicitarEncerramentoLocatario(idImovel);

      // Verificar evento emitido
      await expect(txEncerramento).to.emit(SmartTokenInstance, "SolicitacaoEncerramento").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );
    });

    it("Não deve permitir solicitação PROPRIETÁRIO para imóvel não alugado", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 1000*10 ** 2;//1000,00
      const taxaMulta = 10*10 ** 2; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const imovel = 1
      await expect(
        SmartTokenInstance.connect(addr1 as unknown as Signer).solicitarEncerramentoProprietario(imovel)
      ).to.be.revertedWith("Imovel nao alugado");
    });

    it("Deve permitir que o PROPRIETÁRIO solicite encerramento do contrato", async function () {
      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;

      const aluguelMensal = 1000*10 ** 2;//1000,00
      const taxaMulta = 10*10 ** 2; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(1);
      expect(imovel.locatario).to.equal(await addr2.getAddress());

      const txEncerramento = await SmartTokenInstance.connect(addr1 as unknown as Signer).solicitarEncerramentoProprietario(idImovel);

      // Verificar evento emitido
      await expect(txEncerramento).to.emit(SmartTokenInstance, "SolicitacaoEncerramento").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr1.getAddress(),
      );
    });
  });

  describe("Vistoria", function () {
    it("Deve realizar a vistoria com aprovação", async function () {

      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;
      
      // Adicionar Vistoriador
      await SmartTokenInstance.adicionarVistoriador(await addr3.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.VISTORIADOR_ROLE(), await addr3.getAddress())).to.be.true;

      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      // Alugar o imóvel
      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        1, // ID do imóvel (primeiro imóvel criado)
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(idImovel);
      expect(imovel.locatario).to.equal(await addr2.getAddress());
    
      // Solicita encerramento de contrato de locação
      const txEncerramento = await SmartTokenInstance.connect(addr2 as unknown as Signer).solicitarEncerramentoLocatario(1);

      // Verificar evento emitido
      await expect(txEncerramento).to.emit(SmartTokenInstance, "SolicitacaoEncerramento").withArgs(
        idImovel,
        await addr2.getAddress(),
      );  

      // Realizar a vistoria
      const txVistoria = await SmartTokenInstance.connect(addr3 as unknown as Signer).realizarVistoria(idImovel,true);
      await expect(txVistoria).to.emit(SmartTokenInstance, "VistoriaConcluida").withArgs(
        idImovel,
        true
      );
    });

    it("Deve realizar a vistoria, reprovar o imóvel e emitir multa", async function () {

      // Adicionar proprietário
      await SmartTokenInstance.adicionarProprietario(await addr1.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await addr1.getAddress())).to.be.true;

      // Adicionar Locatario
      await SmartTokenInstance.adicionarLocatario(await addr2.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await addr2.getAddress())).to.be.true;
      
      // Adicionar Vistoriador
      await SmartTokenInstance.adicionarVistoriador(await addr3.getAddress());
      expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.VISTORIADOR_ROLE(), await addr3.getAddress())).to.be.true;
      
      const taxaLocacao = 1000; // 10%
      const aluguelMensal = 100000; //1000,00
      const taxaMulta = 1000; // 10%
      const uri = "https://example.com/imovel/1";

      // added taxa de locação da plataforma
      await SmartTokenInstance.setTaxaLocacao(taxaLocacao); // 10%

      // Chamar a função adicionarImovel como proprietário
      await SmartTokenInstance.connect(addr1 as unknown as Signer).adicionarImovel(aluguelMensal, taxaMulta, uri);

      // Alugar o imóvel
      const idImovel = 1;
      const tx = await SmartTokenInstance.connect(addr2 as unknown as Signer).alugarImovel(idImovel);

      // Verificar evento emitido
      await expect(tx).to.emit(SmartTokenInstance, "ImovelAlugado").withArgs(
        idImovel,
        await addr2.getAddress(),
      );

      // Verificar se o imóvel foi alugado corretamente
      const imovel = await SmartTokenInstance.getImovel(idImovel);
      expect(imovel.locatario).to.equal(await addr2.getAddress());
    
      // Solicita encerramento de contrato de locação
      const txEncerramento = await SmartTokenInstance.connect(addr2 as unknown as Signer).solicitarEncerramentoLocatario(1);

      // Verificar evento emitido
      await expect(txEncerramento).to.emit(SmartTokenInstance, "SolicitacaoEncerramento").withArgs(
        idImovel,
        await addr2.getAddress(),
      );  

      // Realizar a vistoria
      const txVistoria = await SmartTokenInstance.connect(addr3 as unknown as Signer).realizarVistoria(idImovel,false);
      await expect(txVistoria).to.emit(SmartTokenInstance, "VistoriaConcluida").withArgs(
        idImovel,
        false
      );

      // Check Multa
      await expect(txVistoria).to.emit(SmartTokenInstance, "MultaAplicada").withArgs(
        idImovel,
        10000,
      );
    });
    
  });
});

describe("SmartImoveis Contract - Pagar Multa", function () {
  let brlTokenInstance: BRLToken;
  let SmartTokenInstance: SmartImoveis;  
  let owner: SignerWithAddress, locatarioAddress: SignerWithAddress, proprietarioAddress: SignerWithAddress, vistoriadorAddress: SignerWithAddress;

  const MINT_AMOUNT = 1000000; // 1.000.000,00
  const MINT_AMOUNT_INSUFICIENTE = 1; // 1,00
  const TAXA_MULTA = 1000; // 10%
  const MULTA_EXPERADA = 10000; // 10%
  const TAXA_LOCACAO_PLATAFORMA = 1000; // 10%
  const ALUGUEL_MENSAL = 100000; //1000,00
  const idImovel = 1;
  const URI = "https://example.com/imovel/1";

  beforeEach(async function () {
    // Pegando os signatários
    [owner, locatarioAddress, proprietarioAddress, vistoriadorAddress] = await ethers.getSigners();

    // Implantar o contrato BRLToken (ERC20)
    const BRLTokenContract = await ethers.getContractFactory("BRLToken");
    brlTokenInstance = await BRLTokenContract.deploy(owner.address);
    
    // Implantar o contrato SmartImoveis
    const SmartTokenContract = await ethers.getContractFactory("SmartImoveis");
    SmartTokenInstance = await SmartTokenContract.deploy(await brlTokenInstance.getAddress());
    
    // Verificar se o contrato foi implantado corretamente
    expect(await SmartTokenInstance.getAddress()).to.not.be.null;

    // Setar a taxa de locação da plataforma
    await SmartTokenInstance.setTaxaLocacao(TAXA_LOCACAO_PLATAFORMA);

    const taxa = await SmartTokenInstance.getTaxaLocacao();
    expect(taxa).to.equal(TAXA_LOCACAO_PLATAFORMA);

    // Adicionar proprietário
    await SmartTokenInstance.adicionarProprietario(await proprietarioAddress.getAddress());
    expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.PROPRIETARIO_ROLE(), await proprietarioAddress.getAddress())).to.be.true;

    // Adicionar Locatario
    await SmartTokenInstance.adicionarLocatario(await locatarioAddress.getAddress());
    expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.LOCATARIO_ROLE(), await locatarioAddress.getAddress())).to.be.true;

    // Adicionar Vistoriador
    await SmartTokenInstance.adicionarVistoriador(await vistoriadorAddress.getAddress());
    expect(await SmartTokenInstance.hasRole(await SmartTokenInstance.VISTORIADOR_ROLE(), await vistoriadorAddress.getAddress())).to.be.true;

    // Adicionar imóvel
    await SmartTokenInstance.connect(proprietarioAddress as unknown as Signer).adicionarImovel(ALUGUEL_MENSAL, TAXA_MULTA, URI);
    expect(await SmartTokenInstance.getImovel(idImovel)).to.not.be.null;
   
    // Alugar imóvel
    await SmartTokenInstance.connect(locatarioAddress as unknown as Signer).alugarImovel(idImovel);
    expect((await SmartTokenInstance.getImovel(idImovel)).locatario).to.equal(await locatarioAddress.getAddress());    
  });

  it("Deve pagar a multa com sucesso", async function () {
    // Solicitar encerramento
    await expect(SmartTokenInstance.connect(locatarioAddress as unknown as Signer).solicitarEncerramentoLocatario(idImovel))
     .to.emit(SmartTokenInstance, "SolicitacaoEncerramento")
     .withArgs(idImovel, locatarioAddress);

 
   // Configurar vistoria como não aprovada
   await SmartTokenInstance.connect(vistoriadorAddress as unknown as Signer).realizarVistoria(idImovel,false);
   
   // Create tokens for locatario
   await brlTokenInstance.mint(await locatarioAddress.getAddress(), MINT_AMOUNT);
   expect(await brlTokenInstance.balanceOf(await locatarioAddress.getAddress())).to.equal(MINT_AMOUNT * 10 ** 2);

   // Aprovação de tokens
   await brlTokenInstance.connect(locatarioAddress as unknown as Signer).approve(await SmartTokenInstance.getAddress(), 100000);

   // Executa pagamento da multa
   await expect(SmartTokenInstance.connect(locatarioAddress as unknown as Signer).pagarMulta(idImovel))
   .to.emit(SmartTokenInstance, "MultaPaga")
   .withArgs(idImovel, locatarioAddress, MULTA_EXPERADA);

   // Verifica se a multa foi paga
   expect((await SmartTokenInstance.getImovel(idImovel)).isMultaPaga).to.be.true;

   // Confirmar encerramento de contrato de locacao
   expect(await SmartTokenInstance.connect(locatarioAddress as unknown as Signer).confirmarEncerramento(idImovel)).to.not.be.null;

   // Verifica se o imovel está disponivel para locacao
   expect((await SmartTokenInstance.getImovel(idImovel)).isDisponivelParaLocacao).to.be.true;
  });

  it("Deve falhar ao pagar multa com saldo insuficiente", async function () {
    // Solicitar encerramento
    await expect(SmartTokenInstance.connect(locatarioAddress as unknown as Signer).solicitarEncerramentoLocatario(idImovel))
     .to.emit(SmartTokenInstance, "SolicitacaoEncerramento")
     .withArgs(idImovel, locatarioAddress);

 
   // Configurar vistoria como não aprovada
   await SmartTokenInstance.connect(vistoriadorAddress as unknown as Signer).realizarVistoria(idImovel,false);
   
   // Create tokens for locatario
   await brlTokenInstance.mint(await locatarioAddress.getAddress(), MINT_AMOUNT_INSUFICIENTE);
   expect(await brlTokenInstance.balanceOf(await locatarioAddress.getAddress())).to.equal(MINT_AMOUNT_INSUFICIENTE * 10 ** 2);

   // Aprovação de tokens
   await brlTokenInstance.connect(locatarioAddress as unknown as Signer).approve(await SmartTokenInstance.getAddress(), 100000);

   // Executa pagamento da multa
   await expect(
    SmartTokenInstance.connect(locatarioAddress as unknown as Signer).pagarMulta(idImovel)
   ).to.be.revertedWith("Saldo insuficiente");

   // Verifica se a multa foi paga
   expect((await SmartTokenInstance.getImovel(idImovel)).isMultaPaga).to.be.false;

   // Confirmar encerramento de contrato de locacao
   await expect(
   SmartTokenInstance.connect(locatarioAddress as unknown as Signer).confirmarEncerramento(idImovel)
   ).to.be.revertedWith("Multa nao paga ou vistoria nao concluida");

   // Verifica se o imovel está disponivel para locacao
   expect((await SmartTokenInstance.getImovel(idImovel)).isDisponivelParaLocacao).to.be.false;
  });

  it("Deve falhar ao pagar multa quando já foi paga", async function () {
    // Solicitar encerramento
    await expect(SmartTokenInstance.connect(locatarioAddress as unknown as Signer).solicitarEncerramentoLocatario(idImovel))
     .to.emit(SmartTokenInstance, "SolicitacaoEncerramento")
     .withArgs(idImovel, locatarioAddress);

 
    // Configurar vistoria como não aprovada
    await SmartTokenInstance.connect(vistoriadorAddress as unknown as Signer).realizarVistoria(idImovel,false);
   
    // Create tokens for locatario
    await brlTokenInstance.mint(await locatarioAddress.getAddress(), MINT_AMOUNT);
    expect(await brlTokenInstance.balanceOf(await locatarioAddress.getAddress())).to.equal(MINT_AMOUNT * 10 ** 2);

    // Aprovação de tokens
    await brlTokenInstance.connect(locatarioAddress as unknown as Signer).approve(await SmartTokenInstance.getAddress(), 100000);

    // Executa pagamento da multa
    await expect(SmartTokenInstance.connect(locatarioAddress as unknown as Signer).pagarMulta(idImovel))
     .to.emit(SmartTokenInstance, "MultaPaga")
     .withArgs(idImovel, locatarioAddress, MULTA_EXPERADA);

    // Verifica se a multa foi paga
    expect((await SmartTokenInstance.getImovel(idImovel)).isMultaPaga).to.be.true;

    // Executa pagamento da multa pela 2x
    await expect(
     SmartTokenInstance.connect(locatarioAddress as unknown as Signer).pagarMulta(idImovel)
    ).to.be.revertedWith("Multa ja foi paga");
  });
});