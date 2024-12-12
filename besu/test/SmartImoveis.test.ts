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

  describe("Taxa de Plataforma", function () {
    it("Deve permitir que o admin defina a taxa de plataforma", async function () {
      const novaTaxa = 200; // Exemplo de 2% (base 10000)
      await SmartTokenInstance.setTaxaPlataforma(novaTaxa);

      const taxa = await SmartTokenInstance.getTaxaLocacao();
      expect(taxa).to.equal(novaTaxa);
    });

    it("Não deve permitir que o admin defina uma taxa acima do limite máximo de 10%", async function () {
      const taxaAlta = 1200; // 12% (base 10000)
      await expect(SmartTokenInstance.setTaxaPlataforma(taxaAlta))
        .to.be.revertedWith("Taxa nao pode exceder o limite maximo de 10%");
    });

    it("Não deve permitir que um endereço sem a role ADMIN defina a taxa de plataforma", async function () {
        const novaTaxa = 500; // 5% (base 10000)
        try {
          await SmartTokenInstance.connect(addr1 as unknown as Signer).setTaxaPlataforma(novaTaxa);
          // Se não falhar, devemos forçar uma falha no teste
          expect.fail("A transação deveria ter revertido");
        } catch (error: any) {
          // Verificando se o erro contém a string relevante do OpenZeppelin
          console.log(error.message);
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
});
