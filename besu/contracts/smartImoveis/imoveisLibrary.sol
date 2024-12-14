// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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
            bool isVistoriaConcluida;                   // Indica se a vistoria foi concluída
            bool isVistoriaAprovada;                    // Indica se a vistoria foi aprovada
            bool hasMultaPorVistoria;                   // Indica se há multa gerada pela vistoria
            bool isMultaPaga;                           // Indica se a multa foi paga
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
    }
}