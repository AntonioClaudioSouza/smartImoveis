// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./customMathLibrary.sol";

/**
 * @title ImoveisLibrary
 * @dev Biblioteca de estrutura de imóveis
 */
library ImoveisLibrary {
    struct Imovel {
            uint256 id;                                 // Identificador único do imóvel
            address proprietario;                       // Endereço do proprietário
            address locatario;                          // Endereço do locatário (se alugado)
            
            uint256 valorLocacao;                       // Valor mensal da locação
            uint256 taxaMulta;                          // Taxa de multa em caso de infrações
            uint256 proximoVencimento;                  // Timestamp do próximo vencimento
            
            // Estado do imóvel e locação
            bool isDisponivelParaLocacao;               // Indica se o imóvel está disponível para locação
            bool isEncerramentoSolicitadoLocatario;     // Indica se o locatário solicitou encerramento
            bool isEncerramentoSolicitadoProprietario;  // Indica se o proprietário solicitou encerramento
            
            // Vistoria
            bool isSolicitarVistoria;                   // Indica se a solicitação de vistoria do imovel
            bool isVistoriaConcluida;                   // Indica se a vistoria foi concluída
            bool isVistoriaAprovada;                    // Indica se a vistoria foi aprovada
            bool hasMultaPorVistoria;                   // Indica se há multa gerada pela vistoria
            bool isMultaPaga;                           // Indica se a multa foi paga
            uint256 valorMultaVistoria;                 // Valor da multa gerada pela vistoria
        }
    
    
    /**
     * @dev Adiciona um novo imóvel ao contrato
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _proprietario Endereço do proprietário
     * @param _valorLocacao Valor da locação
     * @param _taxaMulta Taxa de multa     
     */
    function adicionarImovel(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _proprietario,
        uint256 _valorLocacao,
        uint256 _taxaMulta
    ) internal {        
        require(_proprietario != address(0), "Proprietario invalido");
        require(_valorLocacao > 0, "Valor da locacao deve ser maior que zero");
        require(_taxaMulta >= 0, "Taxa de multa deve ser maior ou igual a zero");

        Imovel storage novoImovel = _imoveis[_id];
        novoImovel.id = _id;
        novoImovel.proprietario = _proprietario;
        novoImovel.locatario = address(0);  

        novoImovel.valorLocacao = _valorLocacao;        
        novoImovel.taxaMulta = _taxaMulta;
        novoImovel.proximoVencimento = 0;

        novoImovel.isDisponivelParaLocacao = true;
        novoImovel.isEncerramentoSolicitadoLocatario = false;
        novoImovel.isEncerramentoSolicitadoProprietario = false;

        novoImovel.isVistoriaConcluida = false;
        novoImovel.isVistoriaAprovada = false;
        novoImovel.hasMultaPorVistoria = false;
        novoImovel.isMultaPaga = false;        
    }

    /**
     * @dev Aluga um imóvel
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _locatario Endereço do locatário
     */
    function alugarImovel(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _locatario
    ) internal {
        require(_imoveis[_id].id !=0, "Imovel nao existe");        
        
        Imovel storage imovel = _imoveis[_id];
        require(imovel.isDisponivelParaLocacao, "Imovel nao disponivel para locacao");
        require(imovel.locatario == address(0), "Imovel ja alugado");
        require(imovel.proprietario != _locatario, "Proprietario nao pode alugar seu proprio imovel");

        imovel.locatario = _locatario;
        imovel.proximoVencimento = block.timestamp + 30 days;
        imovel.isDisponivelParaLocacao = false;
        imovel.isEncerramentoSolicitadoLocatario = false;
        imovel.isEncerramentoSolicitadoProprietario = false;
        imovel.isVistoriaConcluida = false;
        imovel.isVistoriaAprovada = false;
        imovel.hasMultaPorVistoria = false;
        imovel.isMultaPaga = false;
        imovel.isSolicitarVistoria = false;
        imovel.valorMultaVistoria = 0;
    }
  
    /**
     * @dev Paga o aluguel de um imóvel
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _taxaLocacao Taxa de locação
     * @param _pagador Endereço do pagador
     * @param _plataforma Endereço da plataforma
     * @param _token Contrato do token
     */
    function pagarAluguel(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        uint256 _taxaLocacao,
        address _pagador,
        address _plataforma,
        IERC20 _token
    ) internal returns(uint256,uint256) {
        Imovel storage imovel = _imoveis[_id];
        require(_imoveis[_id].id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(block.timestamp <= imovel.proximoVencimento, "Aluguel ja venceu");

        uint256 taxaPlataforma = CustomMath.calculateTax(imovel.valorLocacao, _taxaLocacao);
        uint256 valorLiquido = CustomMath.calculateNetValue(imovel.valorLocacao,_taxaLocacao);

        require(_token.balanceOf(_pagador) >= imovel.valorLocacao, "Saldo insuficiente");
        require(_token.transferFrom(_pagador, _imoveis[_id].proprietario, valorLiquido), "Falha ao transferir o aluguel ao proprietario");
        require(_token.transferFrom(_pagador, _plataforma, taxaPlataforma), "Falha ao transferir a taxa para a plataforma");
        imovel.proximoVencimento += 30 days;
        return ((taxaPlataforma + valorLiquido), taxaPlataforma);
    }

    /**
     * @dev Solicita o encerramento de um imóvel pelo locatário
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _locatario Endereço do locatário
     */
    function solicitarEncerramentoLocatario(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _locatario
    ) internal {
        Imovel storage imovel = _imoveis[_id];
        require(imovel.id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(imovel.locatario == _locatario, "Somente o locatario pode solicitar o encerramento");
        imovel.isEncerramentoSolicitadoLocatario = true;
        imovel.isVistoriaConcluida = false;
        imovel.isSolicitarVistoria = true;
    }

    /**
    * @dev Solicita o encerramento de um imóvel pelo proprietário
    * @param _imoveis Mapeamento de imóveis
    * @param _id Identificador do imóvel
    * @param _proprietario Endereço do proprietário
    */
    function solicitarEncerramentoProprietario(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _proprietario
    ) internal {
        Imovel storage imovel = _imoveis[_id];
        require(imovel.id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(imovel.proprietario == _proprietario, "Somente o proprietario pode solicitar o encerramento");
        imovel.isEncerramentoSolicitadoProprietario = true;
        imovel.isVistoriaConcluida = false;
        imovel.isSolicitarVistoria = true;
    }

    /**
     * @dev Realiza a vistoria de um imóvel
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _aprovado Indica se a vistoria foi aprovada
     */
    function realizarVistoria(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        bool _aprovado
    ) internal returns(uint256) {
        Imovel storage imovel = _imoveis[_id];
        require(imovel.id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(imovel.isEncerramentoSolicitadoLocatario || imovel.isEncerramentoSolicitadoProprietario, "Encerramento nao solicitado.");

        imovel.isVistoriaConcluida = true;
        imovel.isVistoriaAprovada = _aprovado;
        imovel.valorMultaVistoria = 0;
        
        if (!_aprovado) {
            imovel.valorMultaVistoria = CustomMath.calculateTax(imovel.valorLocacao, imovel.taxaMulta);
            imovel.hasMultaPorVistoria = true; 
            imovel.isMultaPaga = false;           
        }
        return imovel.valorMultaVistoria;
    }

    /**
     * @dev Paga a multa de um imóvel
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     * @param _pagador Endereço do pagador
     * @param _token Contrato do token
     */
    function pagarMulta(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _pagador,
        address _plataforma,
        IERC20 _token
    ) internal returns(uint256, uint256) {
        Imovel storage imovel = _imoveis[_id];
        require(imovel.id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(imovel.locatario == _pagador, "Somente o locatario pode pagar a multa");
        require(imovel.isVistoriaConcluida, "Vistoria nao concluida");
        require(!imovel.isVistoriaAprovada, "Imovel passou na vistoria");
        require(!imovel.isMultaPaga, "Multa ja foi paga");

        uint256 multa = imovel.valorMultaVistoria;
        uint256 taxa = CustomMath.calculateTax(imovel.valorMultaVistoria, imovel.taxaMulta);
        uint256 valorLiquido = CustomMath.calculateNetValue(imovel.valorMultaVistoria, imovel.taxaMulta);

        require(_token.balanceOf(_pagador) >= multa, "Saldo insuficiente");
        require(_token.transferFrom(_pagador, imovel.proprietario, valorLiquido), "Falha ao transferir o valor da multa ao proprietario");
        require(_token.transferFrom(_pagador, _plataforma, taxa), "Falha ao transferir a taxa para a plataforma");

        imovel.isMultaPaga = true;
        return (multa, taxa);
    }

    /**
     * @dev Confirma o encerramento de contrato de locação de um imóvel
     * @param _imoveis Mapeamento de imóveis
     * @param _id Identificador do imóvel
     */
    function confirmarEncerramento(
        mapping(uint256 => Imovel) storage _imoveis,
        uint256 _id,
        address _locatario
    ) internal {
        Imovel storage imovel = _imoveis[_id];
        require(imovel.id != 0, "Imovel nao existe");
        require(imovel.locatario != address(0), "Imovel nao alugado");
        require(imovel.locatario == _locatario, "Somente o locatario pode confirmar o encerramento");
        require(imovel.isVistoriaConcluida, "Vistoria nao concluida");
        require(imovel.isVistoriaAprovada || imovel.isMultaPaga, "Multa nao paga ou vistoria nao concluida");

        imovel.locatario = address(0);
        imovel.proximoVencimento = 0;
        imovel.isDisponivelParaLocacao = true;
        imovel.isEncerramentoSolicitadoLocatario = false;
        imovel.isEncerramentoSolicitadoProprietario = false;
        imovel.isVistoriaConcluida = false;
        imovel.isVistoriaAprovada = false;
        imovel.hasMultaPorVistoria = false;
        imovel.isMultaPaga = false;
    }
}