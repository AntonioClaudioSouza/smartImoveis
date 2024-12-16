// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/math/Math.sol";

library CustomMath {
    using Math for uint256;

    /**
     * @dev Calcula uma taxa sobre um valor base.
     * @param value O valor base sobre o qual a taxa será aplicada.
     * @param taxRate A taxa em base 10000 (e.g., 500 = 5%).
     * @return O valor calculado da taxa.
     */
    function calculateTax(uint256 value, uint256 taxRate) internal pure returns (uint256) {
        require(taxRate <= 10000, "Taxa deve ser menor ou igual a 100%");
        return (value * taxRate) / 10000;
    }

    /**
     * @dev Calcula o valor líquido após deduzir a taxa.
     * @param value O valor base.
     * @param taxRate A taxa em base 10000.
     * @return O valor líquido após a dedução da taxa.
     */
    function calculateNetValue(uint256 value, uint256 taxRate) internal pure returns (uint256) {
        uint256 tax = calculateTax(value, taxRate);
        return value - tax;
    }
}
