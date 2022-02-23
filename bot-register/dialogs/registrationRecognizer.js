const {LuisRecognizer} = require('botbuilder-ai');

/**
 * Classe para fazer a conexão com os serviços do Luis
 * @class
 */
class RegistrationRecognizer {

    /**
     * @constructor
     * Objeto com as configurações de acesso ao Luis
     * @param {Object} luisConfig 
     */
    constructor(luisConfig){
        /**
         * Verifica se o Luis foi configurado
         * @type {boolean} */
        const luisIsConfigured = luisConfig && luisConfig.applicationId && luisConfig.endpointKey && luisConfig.endpoint;

        if(luisIsConfigured){
            /**
             * Objeto com informação da versão da API.
             * @type {object} */
            const recognizerOptions = {apiVersion: 'v3'};
            this.luisRecognize = new LuisRecognizer(luisConfig,recognizerOptions);
        }
    }

    /**
     * Procura por uma Intenção cadastrada no Luis.
     * @param {string} context 
     * @returns {Promise}
     */
    async executeQuery(context){
        return await this.luisRecognize.recognize(context);
    }

    /**
     * Retorna a Intenção reconhecida pelo Luis.
     * @param {Promise} option 
     * @returns {String}
     */
    getOption(option){
        return LuisRecognizer.topIntent(option);
    }
   
    /**
     * Busca por uma determinada entidade criada no Luis.
     * @param {string} context 
     * @returns {Promise}
     */
    async getEntities(context){
        const result = await this.luisRecognize.recognize( context );
        return result;
    }
}

module.exports.RegistrationRecognizer = RegistrationRecognizer;