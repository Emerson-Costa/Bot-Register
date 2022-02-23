
const {
    WaterfallDialog,
    TextPrompt,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    ChoiceFactory
} = require('botbuilder-dialogs');

const { InputHints } = require('botbuilder');

/**@module CepAPI - Importação do módulo de resição da API do VIACEP */
const { CepAPI } = require('../services/cepAPI');

/**@module RegistrationRecognizer - Importação do módulo que contém o acesso ao serviço do Luis.*/
const { RegistrationRecognizer } = require('./registrationRecognizer');

/**@module insert - Importação do módulo de mensagem da aplicação*/
const insert = require('./messages');

/**
 *  Tag para entrada do nome via prompt.
 *  @type {string}*/
const NAME_PROMPT         = 'NAME_PROMPT'      ;

/**
 *  Tag para entrada da idade via prompt.
 *  @type {string} */
const AGE_PROMPT          = 'AGE_PROMPT'       ;

/**
 *  Tag para entrada do gênero via prompt.
 *  @type {string} */
const GENDER_PROMPT       = 'GENDER_PROMPT'    ;

/**
 *  Tag para entrada do CPF via prompt.
 *  @type {string} */
const CPF_PROMPT          = 'CPF_PROMPT'       ;

/**
 *  Tag para entrada do CEP via prompt.
 *  @type {string} */
const CEP_PROMPT          = 'CEP_PROMPT'       ;

/**
 *  Tag para entrada da Data de Nascimento via prompt.
 *  @type {string} */
const BIRTHDAY_PROMPT     = 'BIRTHDAY_PROMPT'  ;

/**
 *  Tag para entrada de confirmação via prompt.
 *  @type {string} */
const CONFIRM_PROMPT      = 'CONFIRM_PROMPT'   ;

/**
 *  Tag para entrada da cascacata de diálogo via prompt.
 *  @type {string} */
const WATERFALL_DIALOG    = 'WATERFALL_DIALOG' ;

/**
 *  Tag para link de serviços de diálogo do bot.
 *  @type {string} */
const MAIN_DIALOG         = 'MainDialog'       ;

/**
 *  Tag para link de serviços de diálogo do bot.
 *  @type {string} */
const REGISTRATION_DIALOG = 'RegistrationDialog';

/**
 *  Objeto para armazenar os dados do usuário.
 *  @type {Object} */
let people = {}

/**
 * Classe para registro de diálogo do Bot.
 * @class */
class RegistrationDialog extends ComponentDialog{

    /**
     * @constructor
     * @param {Object} luisConfig - Objeto com as configurações de acesso aos serviços do Luis
     */
    constructor(luisConfig){
        super('RegistrationDialog')
        
        /**
         * Instância dos serviços do Luis.
         * @type {InstanceType} */
        this.registrationRecognizer = new RegistrationRecognizer(luisConfig);

        /**
         * Instância da classe para Requisição da API VIACEP.
         * @type {InstanceType} */
        this.result = new CepAPI( );

        /**
         * Recebe uma promessa da requisição da API VIACEP.
         * @type {Promise} */
        this.requisition = null; 

        this.addDialog(new TextPrompt(NAME_PROMPT))
            .addDialog(new TextPrompt(AGE_PROMPT, this.ageValidator.bind(this)))
            .addDialog(new ChoicePrompt(GENDER_PROMPT))
            .addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator.bind(this)))
            .addDialog(new TextPrompt(CEP_PROMPT, this.cepValidator.bind(this)))
            .addDialog(new TextPrompt(BIRTHDAY_PROMPT, this.dateValidator.bind(this)))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
   
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG,[
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.genderStep.bind(this),
            this.cpfStep.bind(this),
            this.cepStep.bind(this),
            this.birthdayStep.bind(this),
            this.confirmStep.bind(this),
            this.finalStep.bind(this)
        ]));
        
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Retorna o nome informado pelo usuário.
     * @param {context} step 
     * @returns {context} 
     */
    nameStep = async (step) => {
        return await step.prompt(NAME_PROMPT, insert.messages.dialogName); 
    }

    /**
     * Retona a idade informada pelo usuário.
     * @param {context} step 
     * @returns {context}
     */
    ageStep = async (step) => {
        step.values.name = step.result;
        const promptOptions = { prompt: insert.messages.dialogAge, retryPrompt: insert.messages.errorAge};
        return await step.prompt(AGE_PROMPT,promptOptions );   
    }

    /**
     * Retorna o gênero informado pelo usuário.
     * @param {context} step 
     * @returns {context}
     */
    genderStep = async (step) => {
        step.values.age = step.result;
        return await step.prompt(GENDER_PROMPT, {
            prompt: insert.messages.dialogGender, 
            choices: ChoiceFactory.toChoices(['Masculino', 'Feminino'])
        });
    }

    /**
     * Retorna o cpf Informado pelo usuário.
     * @param {context} step 
     * @returns {context}
     */
    cpfStep = async (step) => {
        step.values.gender = step.result;
        const promptOptions = {prompt: insert.messages.dialogCpf, retryPrompt: insert.messages.errorCpf};
        return await step.prompt(CPF_PROMPT, promptOptions); 
    }

    /**
     * Retorna o CEP informado pelo usuário.
     * @param {context} step 
     * @returns {context}
     */
    cepStep = async (step) => {
        step.values.cpf = step.result.replace(/[^\d]/g, "");
        step.values.cpf = step.values.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        const promptOptions = { prompt: insert.messages.dialogCep, retryPrompt: insert.messages.errorCep};
        return await step.prompt(CEP_PROMPT,promptOptions);
    }
    
    /**
     * Retorna a data de aniversário informado pelo usuário
     * @param {context} step 
     * @returns {context}
     */
    birthdayStep = async (step) => {
        step.values.cep = step.result.replace(/[^\d]/g, "");
        
        /* Requisitando dados através do CEP */
        this.requisition = await this.result.dataRequitition(step.values.cep);
        const promptOptions = { prompt: insert.messages.dialogBirthday, retryPrompt: insert.messages.errorBirthday};
        return await step.prompt(BIRTHDAY_PROMPT,promptOptions);
    }

    /**
     * Retona a confirmação do usuário.
     * @param {context} step 
     * @returns {boolean}
     */
    confirmStep = async (step) => {
        // Armazenando todos os dados no objeto people.
        people.name    = step.values.name;
        people.age     = step.values.age;
        people.gender  = step.values.gender;
        people.cpf     = step.values.cpf;
        people.locale  = this.requisition.data.localidade;
        people.uf      = this.requisition.data.uf;
        // Formatando a Data de Aniversário.
        people.birthday = step.result.split('-').join('/');
        
        // Retornando as mensagens com as informações do cadastro.
        await step.context.sendActivity(
            insert.messages.peopleInfor(people.name, people.birthday, people.gender.value, people.cpf, people.locale, people.uf),
            insert.messages.peopleInfor(people.name, people.birthday, people.gender.value, people.cpf, people.locale, people.uf), 
            InputHints.IgnoringInput);
        // Confirmação dos dados informados.
        return await step.prompt(CONFIRM_PROMPT,insert.messages.dialogConfirm, ['yes', 'no']);     
    }

    /**
     * Retorna o diálogo a ser definido de acordo com a escolha do usuário.
     * @param {context} step 
     * @returns {$instance}
     */
    finalStep = async(step) => {
        if(step.result == true){
            await step.context.sendActivity( insert.messages.dialogWellcome, insert.messages.dialogWellcome, InputHints.IgnoringInput);  
            return await step.replaceDialog(MAIN_DIALOG);
        }else{
            return await step.replaceDialog(REGISTRATION_DIALOG);
        }  
    }

    /**
     * Validar idade, a idade não pode ser menor que 1.
     * @param {context} promptContext 
     * @returns {boolean}
     */
    ageValidator = async (promptContext) => {
        /**
         * Promessa com os dados de uma entidade construída no Luis.
         * @type {Promise} */
        const value = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);

        /** Verifica se a instância number existe e se o valor desta instância é maior doque zero.*/ 
        const result = promptContext.recognized.succeeded && value.entities.$instance.number !== undefined && value.entities.$instance.number[0].text > 0;
        if(result == false){
            return result;
        }else{
            return true;
        }   
    }

    /**
     * Validar CPF
     * @param {context} promptContext 
     * @returns {boolean}
     */
    cpfValidator = async (promptContext) => {
        /**
         * Promessa com os dados de uma entidade construída no Luis.
         * @type {Promise} */
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);

        /** Verifica se a entidade CPFnumber existe */
        if(result.entities.$instance.CPFnumber !== undefined){
            return true;
        }else{
            return false;
        }       
    }

    /**
     * Validar CEP
     * @param {context} promptContext 
     * @returns {boolean}
     */
    cepValidator =  async (promptContext) => {
        /**
         * Promessa com os dados de uma entidade construída no Luis.
         * @type {Promise} */
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);
        /** Verifica se a entidade CEPnumber existe */
        if(result.entities.$instance.CEPnumber !== undefined){
            return true;
        }else{
            return false;
        }       
    }

    /**
     * Validar Data
     * @param {context} promptContext 
     * @returns {boolean}
     */
    dateValidator = async (promptContext) => {
        /**
         * promessa com os dados de uma entidade construída no Luis.
         * @type {Promise} */
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);

        /** Verifica se a entidade Date existe */
        if(result.entities.$instance.Date !== undefined){
            return true;
        }else{
            return false;
        }    
    }
}

module.exports.RegistrationDialog = RegistrationDialog;