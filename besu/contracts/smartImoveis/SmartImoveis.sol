// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./configBase.sol";
import "./eventsLibrary.sol";
import "./imoveisLibrary.sol";

contract SmartImoveis is ERC721URIStorage, ConfigBase {
    using Events for *;
    using ImoveisLibrary for mapping(uint256 => ImoveisLibrary.Imovel);

    IERC20 private token;
    mapping(uint256 => ImoveisLibrary.Imovel) private imoveis;
    mapping(address => uint256[]) private alugueisDoLocatario;
    mapping(address => uint256[]) private alugueisDoProprietario;
    mapping(address => uint256[]) private imoveisDoProprietario;

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    constructor(address _tokenAddress) ERC721("ImoveisNFT", "IMV") {
        token = IERC20(_tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);        
        _grantRole(ADMIN_ROLE, msg.sender);   
    }

    function getImovel(uint256 _id) public view returns(ImoveisLibrary.Imovel memory){
        require(imoveis[_id].id != 0, "Imovel nao existe");
        return imoveis[_id];
    }

    function adicionarImovel(
        uint256 _aluguelMensal,
        uint256 _taxaMulta,
        string memory _uri
    )public onlyRole(PROPRIETARIO_ROLE)returns(uint256){
        require(_aluguelMensal > 0, "Valor do aluguel deve ser maior que zero");

        uint256 id = config.proximoIdImovel;
        _mint(msg.sender, id);
        _setTokenURI(id, _uri);
       
        imoveis.adicionarImovel(id, msg.sender, _aluguelMensal, _taxaMulta);
        emit Events.ImovelAdicionado(id, msg.sender, _aluguelMensal, _taxaMulta, _uri);
       
        config.proximoIdImovel++;
        return id;
    }

    function alugarImovel(uint256 _id) public onlyRole(LOCATARIO_ROLE){
        imoveis.alugarImovel(_id, msg.sender);
        alugueisDoLocatario[msg.sender].push(_id);
        emit Events.ImovelAlugado(_id, msg.sender);
    }

    function pagarAluguel(uint256 _id) public onlyRole(LOCATARIO_ROLE){
        (uint256 valorPagto, uint256 taxaPlataforma) = imoveis.pagarAluguel(_id, config.taxaLocacao, msg.sender, config.adminAddress, token);
        emit Events.AluguelPago(_id, msg.sender,valorPagto);
        emit Events.TaxaPlataformaEnviada(_id, taxaPlataforma);
    }

    function solicitarEncerramentoLocatario(uint256 _id) public onlyRole(LOCATARIO_ROLE){
        imoveis.solicitarEncerramentoLocatario(_id, msg.sender);
        emit Events.SolicitacaoEncerramento(_id, msg.sender);
    }

    function solicitarEncerramentoProprietario(uint256 _id) public onlyRole(PROPRIETARIO_ROLE){
        imoveis.solicitarEncerramentoProprietario(_id, msg.sender);
        emit Events.SolicitacaoEncerramento(_id, msg.sender);
    }

    function realizarVistoria(uint256 _id, bool _aprovado) public onlyRole(VISTORIADOR_ROLE){
        uint256 multa = imoveis.realizarVistoria(_id, _aprovado);
        if(multa>0){
            emit Events.MultaAplicada(_id, multa);
        }      
        emit Events.VistoriaConcluida(_id, _aprovado);
    }

    function pagarMulta(uint256 _id) public onlyRole(LOCATARIO_ROLE){
        (uint256 multa, uint256 taxa) = imoveis.pagarMulta(_id, msg.sender, config.adminAddress, token);
        emit Events.MultaPaga(_id, msg.sender, multa);
        emit Events.TaxaPlataformaEnviada(_id, taxa);
    }

    function confirmarEncerramento(uint256 _id) public onlyRole(LOCATARIO_ROLE){
        imoveis.confirmarEncerramento(_id, msg.sender);
        emit Events.EncerramentoConfirmado(_id, msg.sender);
    }
}