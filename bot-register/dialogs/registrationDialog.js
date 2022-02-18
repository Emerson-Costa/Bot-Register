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
// Importando os serviço REST para o cep.
const { CepAPI } = require('../services/cepAPI'); 
// Importando a Classe com os serviços do Luis.
const { RegistrationRecognizer } = require('./registrationRecognizer');
// Importando as mensagens para o uso no prompt.
const { Messages } = require('./messages');

const NAME_PROMPT         = 'NAME_PROMPT'      ;
const AGE_PROMPT          = 'AGE_PROMPT'       ;
const GENDER_PROMPT       = 'GENDER_PROMPT'    ;
const CPF_PROMPT          = 'CPF_PROMPT'       ;
const CEP_PROMPT          = 'CEP_PROMPT'       ;
const BIRTHDAY_PROMPT     = 'BIRTHDAY_PROMPT'  ;
const CONFIRM_PROMPT      = 'CONFIRM_PROMPT'   ;
const WATERFALL_DIALOG    = 'WATERFALL_DIALOG' ;
const MAIN_DIALOG         = 'MainDialog'       ;
const REGISTRATION_DIALOG = 'RegistrationDialog';

// Objeto para armazenar os dados do usuário. 
let people = {}

class RegistrationDialog extends ComponentDialog{
    constructor(luisConfig){
        super('RegistrationDialog')
        this.registrationRecognizer = new RegistrationRecognizer(luisConfig);
        this.promptMessage = new Messages();

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

    nameStep = async (step) => {
        return await step.prompt(NAME_PROMPT, this.promptMessage.dialogName()); 
    }

    ageStep = async (step) => {
        step.values.name = step.result;
        const promptOptions = { prompt: this.promptMessage.dialogAge(), retryPrompt: this.promptMessage.errorAge()};
        return await step.prompt(AGE_PROMPT,promptOptions );   
    }

    genderStep = async (step) => {
        step.values.age = step.result;
        return await step.prompt(GENDER_PROMPT, {
            prompt: this.promptMessage.dialogGender() , 
            choices: ChoiceFactory.toChoices(['Masculino', 'Feminino'])
        });
    }

    cpfStep = async (step) => {
        step.values.gender = step.result;
        const promptOptions = { prompt: this.promptMessage.dialogCpf(), retryPrompt: this.promptMessage.errorCpf()};
        return await step.prompt(CPF_PROMPT, promptOptions); 
    }

    cepStep = async (step) => {
        // Inserindo o formato padrão do CPF.
        step.values.cpf = step.result.replace(/[^\d]/g, "");
        step.values.cpf = step.values.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        const promptOptions = { prompt: this.promptMessage.dialogCep(), retryPrompt: this.promptMessage.errorCep()};
        return await step.prompt(CEP_PROMPT,promptOptions);
    }

    birthdayStep = async (step) => {
        step.values.cep = step.result;
        const promptOptions = { prompt: this.promptMessage.dialogBirthday(), retryPrompt: this.promptMessage.errorBirthday()};
        return await step.prompt(BIRTHDAY_PROMPT,promptOptions);
    }

    confirmStep = async (step) => {
        // Armazenando todos os dados no objeto people.
        people.name    = step.values.name;
        people.age     = step.values.age;
        people.gender  = step.values.gender;
        people.cpf     = step.values.cpf;
        // Obtendo o endereço através do cep.
        let result = new CepAPI(step.values.cep); 
        people.locale  = await result.localidade();
        people.uf      = await result.uf();
        // Formatando a Data de Aniversário.
        people.birthday = step.result.split('-').join('/');
        
        // Retornando as mensagens com as informações do cadastro.
        await step.context.sendActivity(
            this.promptMessage.peopleInfor(people.name, people.birthday, people.gender.value, people.cpf, people.locale, people.uf),
            this.promptMessage.peopleInfor(people.name, people.birthday, people.gender.value, people.cpf, people.locale, people.uf), 
            InputHints.IgnoringInput);
        // Confirmação dos dados informados.
        return await step.prompt(CONFIRM_PROMPT,this.promptMessage.dialogConfirm(), ['yes', 'no']);     
    }

    finalStep = async(step) => {
        if(step.result == true){
            await step.context.sendActivity( this.promptMessage.dialogWellcome(),  this.promptMessage.dialogWellcome(), InputHints.IgnoringInput);  
            return await step.replaceDialog(MAIN_DIALOG);
        }else{
            return await step.replaceDialog(REGISTRATION_DIALOG);
        }  
    }

    ageValidator = async (promptContext) => {
        const value = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);
        // verifica se a idade informada é maior que 0 e se o valor é um numero inteiro, se não for a instãncia do valor não é definida no contexto. 
        const result = promptContext.recognized.succeeded && promptContext.recognized.value > 0 && value.entities.$instance.Age !== undefined;
        if(result == false){
            return result;
        }else{
            return true;
        }   
    }

    cpfValidator = async (promptContext) => {
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);
        if(result.entities.$instance.CPFnumber !== undefined){
            return true;
        }else{
            return false;
        }       
    }

    cepValidator =  async (promptContext) => {
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);
        if(result.entities.$instance.CEPnumber !== undefined){
            return true;
        }else{
            return false;
        }       
    }

    dateValidator = async (promptContext) => {
        const result = await this.registrationRecognizer.executeQuery(promptContext.recognized.value);
        if(result.entities.$instance.Date !== undefined){
            return true;
        }else{
            return false;
        }    
    }
}

module.exports.RegistrationDialog = RegistrationDialog;
