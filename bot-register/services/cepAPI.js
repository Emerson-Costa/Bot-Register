const { default: axios } = require('axios');

class CepAPI {
    constructor(cep){
        this.cep = cep;
    }

    async localidade(){
        let result =  await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        return result.data.localidade;
    }

    async logradouro(){
        let result =  await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        return result.data.logradouro;
    }

    async bairro(){
        let result = await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        return result.data.bairro;
    }

    async localidade(){
        let result = await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        return result.data.localidade;
    }

    async uf(){
        let result = await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        return result.data.uf;
    }   
}
module.exports.CepAPI = CepAPI;
