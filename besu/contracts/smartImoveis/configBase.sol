// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./eventsLibrary.sol";

/**
 * @title ConfigBase
 * @dev Contrato base para configuração da plataforma
 */
contract ConfigBase is AccessControl {    
    using Events for *;

    struct ConfigPlataforma {
        uint256 proximoIdImovel;    // ID do próximo imóvel a ser registrado
        uint256 taxaLocacao;        // Taxa administrativa de locação da plataforma (1% = 100)
        uint256 taxaMaximaLocacao;  // Taxa máxima permitida (10% = 1000 em base 10000)        
    }

    // Roles do AccessControl
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPRIETARIO_ROLE = keccak256("PROPRIETARIO_ROLE");
    bytes32 public constant VISTORIADOR_ROLE = keccak256("VISTORIADOR_ROLE");
    bytes32 public constant LOCATARIO_ROLE = keccak256("LOCATARIO_ROLE");

    // Estrutura de configuração da plataforma
    ConfigPlataforma internal config;

    constructor() {
        config = ConfigPlataforma({
            proximoIdImovel: 1,
            taxaLocacao: 100,         // 1% em base 10000
            taxaMaximaLocacao: 1000  // 10% em base 10000
        });      
    }
 
    function getTaxaLocacao() public view returns(uint256) {
        return config.taxaLocacao;
    }

    function getTaxaMaximaLocacao() public view returns(uint256) {
        return config.taxaMaximaLocacao;
    }

    function setTaxaLocacao(uint256 _novaTaxa) public onlyRole(ADMIN_ROLE) {
        require(_novaTaxa >= 0, "Taxa deve ser maior ou igual a zero");        
        require(_novaTaxa <= config.taxaMaximaLocacao, "Taxa nao pode exceder o limite maximo de 10%");
        config.taxaLocacao = _novaTaxa;   
        emit Events.TaxaPlataformaDefinida(_novaTaxa);
    }


    // Funções para adicionar e remover address para ROLES de locatarios, proprietarios e vistoriadores
    function adicionarLocatario(address _locatario) public onlyRole(ADMIN_ROLE) {
        require(!hasRole(LOCATARIO_ROLE, _locatario), "O locatario ja definido");
        _grantRole(LOCATARIO_ROLE, _locatario);
        emit Events.LocatarioAdicionado(_locatario);
    }

    function removerLocatario(address _locatario) public onlyRole(ADMIN_ROLE) {
        require(hasRole(LOCATARIO_ROLE, _locatario), "O endereco nao e um locatario.");
        _revokeRole(LOCATARIO_ROLE, _locatario);
        emit Events.LocatarioRemovido(_locatario);
    }

    function adicionarProprietario(address _proprietario) public onlyRole(ADMIN_ROLE) {
        require(!hasRole(PROPRIETARIO_ROLE, _proprietario), "proprietario ja definido");
        _grantRole(PROPRIETARIO_ROLE, _proprietario);
        emit Events.ProprietarioAdicionado(_proprietario);
    }

    function removerProprietario(address _proprietario) public onlyRole(ADMIN_ROLE) {
        require(hasRole(PROPRIETARIO_ROLE, _proprietario), "O endereco nao e um proprietario.");
        _revokeRole(PROPRIETARIO_ROLE, _proprietario);
        emit Events.ProprietarioRemovido(_proprietario);
    }

    function adicionarVistoriador(address _vistoriador) public onlyRole(ADMIN_ROLE) {
        require(!hasRole(VISTORIADOR_ROLE, _vistoriador), "O vistoriador ja definido");
        _grantRole(VISTORIADOR_ROLE, _vistoriador);
         emit Events.VistoriadorAdicionado(_vistoriador);
    }

    function removerVistoriador(address _vistoriador) public onlyRole(ADMIN_ROLE) {
        require(hasRole(VISTORIADOR_ROLE, _vistoriador), "O endereco nao e um vistoriador.");
        _revokeRole(VISTORIADOR_ROLE, _vistoriador);
        emit Events.VistoriadorRemovido(_vistoriador);
    }
}