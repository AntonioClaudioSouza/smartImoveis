// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./events.sol";

contract SmartImoveis is ERC721, AccessControl{
    using Events for *;

    IERC20 public token;
    uint256 public proximoIdImovel = 1;  // Id proximo imovel
    uint256 public taxaPlataforma = 100; // Taxa administrativa da plataforma (1% = 100)
    uint256 public constanteTaxaMaxima = 1000; // 10% em base 10000

    // Roles do AccessControl
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPRIETARIO_ROLE = keccak256("PROPRIETARIO_ROLE");
    bytes32 public constant VISTORIADOR_ROLE = keccak256("VISTORIADOR_ROLE");
    bytes32 public constant LOCATARIO_ROLE = keccak256("LOCATARIO_ROLE");

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    constructor(address _tokenAddress) ERC721("ImoveisNFT", "IMV") {
        token = IERC20(_tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);        
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Função para configurar a taxa administrativa
    function definirTaxaPlataforma(uint256 _novaTaxa) public onlyRole(ADMIN_ROLE) {
        require(_novaTaxa <= constanteTaxaMaxima, "Taxa nao pode exceder o limite maximo de 10%");
        taxaPlataforma = _novaTaxa;
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