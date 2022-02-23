const { default: axios } = require('axios');

/**
 * Classe para fazer requisição da API VIACEP.
 * @class
 */
class CepAPI {
    /**
     * Construtor vazio.
     * @constructor
     */
    constructor( ){ }

    /**
     * Método para buscar o endereço pelo numero do cep.
     * @param {String} cep - cep do endereço informado pelo usuário
     * @returns {Promise}
     */
    async dataRequitition(cep) {
        return await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    }
}

module.exports.CepAPI = CepAPI;