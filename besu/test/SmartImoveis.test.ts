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
      const novaTaxa = 200; // Exemplo de 2% (base 10000)
      await SmartTokenInstance.setTaxaLocacao(novaTaxa);

      const taxa = await SmartTokenInstance.getTaxaLocacao();
      expect(taxa).to.equal(novaTaxa);
    });

    it("Não deve permitir que o admin defina uma taxa acima do limite máximo de 10%", async function () {
      const taxaAlta = 1200; // 12% (base 10000)
      await expect(SmartTokenInstance.setTaxaLocacao(taxaAlta))
        .to.be.revertedWith("Taxa nao pode exceder o limite maximo de 10%");
    });

    it("Não deve permitir que um endereço sem a role ADMIN defina a taxa de locação da plataforma", async function () {
        const novaTaxa = 500; // 5% (base 10000)
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

});
