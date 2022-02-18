const axios = require('axios');

// Validar Cep
cepValidator = ( cep ) => { 
    regexCep = /^[0-9]{8}$/; 
    return regexCep.test(cep);
}

// Buscar Endereço
addressSearch = async (cep) => {
    let result = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    console.log(result.data);            
}

// Formatar saída de dados CPF
function CPFformat(cpf) {
    //retira os caracteres indesejados...
  cpf = cpf.replace(/[^\d]/g, "");
  //realizar a formatação...
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); 
}    

// Formatar saída de dados Telephone
function celFormat(cel) {
    //retira os caracteres indesejados...
  cel = cel.replace(/[^\d]/g, "");
  //realizar a formatação...
    return cel.replace(/(\d{5})(\d{4})/, "$1-$2"); 
} 

// Formatar saída de Data Americana para PT-BR
let dateFormatBrasilian = (data) => data.split('-').reverse().join('/');



console.log(celFormat('98160-2417'))




