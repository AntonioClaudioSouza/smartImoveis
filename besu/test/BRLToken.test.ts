import { ethers } from "hardhat";
import { expect } from "chai";

describe("BRLToken", function () {
    let BRLToken: any;
    let brlToken: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        // Obter as contas
        [owner, addr1, addr2] = await ethers.getSigners();

        // Implantar o contrato com o endereço do owner
        BRLToken = await ethers.getContractFactory("BRLToken");
        brlToken = await BRLToken.deploy(owner.address);
    });

    it("Deve ter o nome e o símbolo corretos", async function () {
        expect(await brlToken.name()).to.equal("BRL Token");
        expect(await brlToken.symbol()).to.equal("BRL");
    });

    it("Deve ter 3 casas decimais", async function () {
        expect(await brlToken.decimals()).to.equal(3);
    });

    it("Deve permitir que o proprietário emita tokens", async function () {
        const mintAmount = 1000; // 1000 tokens com 3 casas decimais
        await brlToken.mint(addr1.address, mintAmount);

        // Verificar o saldo de addr1
        const balance = await brlToken.balanceOf(addr1.address);
        expect(balance).to.equal(mintAmount * 10 ** 3); // 1000 * 10^3 = 1.000.000 tokens com 3 casas decimais
    });

    it("Não deve permitir que não-proprietários emitam tokens", async function () {
        const mintAmount = 1000;
    
        // Espera que o mint falhe para addr1 (não-proprietário) com o erro personalizado
        await expect(brlToken.connect(addr1).mint(addr2.address, mintAmount))
            .to.be.revertedWithCustomError(brlToken, "OwnableUnauthorizedAccount")
            .withArgs(addr1.address);  // Verifica se o erro está associando o endereço de addr1
    });

    it("Deve permitir que o proprietário transfira tokens", async function () {
        const mintAmount = 1000;
        await brlToken.mint(owner.address, mintAmount);

        // Verificar o saldo inicial do proprietário
        const initialBalance = await brlToken.balanceOf(owner.address);
        expect(initialBalance).to.equal(mintAmount * 10 ** 3); // 1000 * 10^3 = 1.000.000 tokens com 3 casas decimais

        // Transferir tokens para addr1
        await brlToken.transfer(addr1.address, mintAmount * 10 ** 3);

        // Verificar os saldos após a transferência
        const finalOwnerBalance = await brlToken.balanceOf(owner.address);
        const finalAddr1Balance = await brlToken.balanceOf(addr1.address);

        expect(finalOwnerBalance).to.equal(0);
        expect(finalAddr1Balance).to.equal(mintAmount * 10 ** 3);
    });
});
