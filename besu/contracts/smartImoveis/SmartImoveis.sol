// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./configBase.sol";
import "./events.sol";
import "./datatypes.sol";

contract SmartImoveis is ERC721, ConfigBase {
    IERC20 private token;
    mapping(uint256 => Datatypes.Imovel) private imoveis;

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
}