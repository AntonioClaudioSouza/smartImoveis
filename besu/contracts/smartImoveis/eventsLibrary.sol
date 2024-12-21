// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title Events
 * @dev Biblioteca de eventos
 */
library Events {
    event ImovelAdicionado(uint256 id, address proprietario, uint256 aluguelMensal, uint256 taxaMulta, string uri);
    event ImovelAlugado(uint256 id, address locatario);
    event AluguelPago(uint256 id, address locatario, uint256 valor);
    event SolicitacaoEncerramento(uint256 id, address solicitante);
    event VistoriaConcluida(uint256 id, bool passou);
    event MultaAplicada(uint256 id, uint256 valor);
    event MultaPaga(uint256 id, address locatario, uint256 valor);
    event EncerramentoConfirmado(uint256 id,address locatario);
    
    event TaxaPlataformaEnviada(uint256 id, uint256 valor);
    event TaxaPlataformaDefinida(uint256 novaTaxa);

    event LocatarioAdicionado(address locatario);
    event LocatarioRemovido(address locatario);

    event ProprietarioAdicionado(address proprietario);
    event ProprietarioRemovido(address proprietario);

    event VistoriadorAdicionado(address vistoriador);
    event VistoriadorRemovido(address vistoriador);
}
