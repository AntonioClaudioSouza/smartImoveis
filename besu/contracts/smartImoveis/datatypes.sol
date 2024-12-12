// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library Datatypes {    
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

    struct ConfigPlataforma {
        uint256 proximoIdImovel;                    // ID do próximo imóvel a ser registrado
        uint256 taxaLocacao;                        // Taxa administrativa de locação da plataforma (1% = 100)
        uint256 taxaMaximaLocacao;                  // Taxa máxima permitida (10% = 1000 em base 10000)        
    }
}
