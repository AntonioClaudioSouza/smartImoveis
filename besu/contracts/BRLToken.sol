// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BRLToken is ERC20, Ownable {
    uint8 private _decimals = 2;
    constructor(address initialOwner)
        ERC20("BRL Token", "BRL")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount* 10 ** uint256(_decimals));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
