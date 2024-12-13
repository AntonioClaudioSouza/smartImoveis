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

    function adicionarImovel(
        uint256 _aluguelMensal,
        uint256 _taxaMulta,
        string memory _uri
    )public onlyRole(PROPRIETARIO_ROLE){
        require(_aluguelMensal > 0, "Valor do aluguel deve ser maior que zero");

        uint256 id = config.proximoIdImovel;
        _mint(msg.sender, id);
        _setTokenURI(id, _uri);
        imoveis.adicionarImovel(id, msg.sender, _aluguelMensal, _taxaMulta);
        emit Events.ImovelAdicionado(id, msg.sender, _aluguelMensal, _taxaMulta, _uri);
        config.proximoIdImovel++;
    }
}