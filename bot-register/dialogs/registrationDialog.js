const {
    WaterfallDialog,
    TextPrompt,
    NumberPrompt,
    ChoicePrompt,
    DateTimePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    ChoiceFactory
} = require('botbuilder-dialogs');

const { InputHints } = require('botbuilder');
const { default: axios } = require('axios');

const NAME_PROMPT      = 'NAME_PROMPT'      ;
const AGE_PROMPT       = 'AGE_PROMPT'       ;
const GENDER_PROMPT    = 'GENDER_PROMPT'    ;
const CPF_PROMPT       = 'CPF_PROMPT'       ;
const CEP_PROMPT       = 'CEP_PROMPT'       ;
const BIRTHDAY_PROMPT  = 'BIRTHDAY_PROMPT'  ;
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT'   ;
const WATERFALL_DIALOG = 'WATERFALL_DIALOG' ;
const USER_PROFILE     = 'USER_PROFILE'     ;

let people = {}

class RegistrationDialog extends ComponentDialog{
    constructor( ){
        super('RegistrationDialog')

        this.addDialog(new TextPrompt(NAME_PROMPT))
        .addDialog(new NumberPrompt(AGE_PROMPT,this.ageValidator))
        .addDialog(new ChoicePrompt(GENDER_PROMPT))
        .addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator))
        .addDialog(new TextPrompt(CEP_PROMPT,this.cepValidator))
        .addDialog(new DateTimePrompt(BIRTHDAY_PROMPT),this.dateTimeValidator,'AM')
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

    async nameStep(step){
        const msg = 'Por favor informe o teu nome.';
        return await step.prompt(NAME_PROMPT, msg ); 
    }

    async ageStep(step){
        step.values.name = step.result;
        const msg = 'Agora eu preciso que informe a tua idade.';
        return await step.prompt(AGE_PROMPT, msg );  
    }

    async genderStep (step){
        step.values.age = step.result;
        const msg = 'Qual é o seu gênero';
        return await step.prompt(GENDER_PROMPT, {
            prompt: msg , 
            choices: ChoiceFactory.toChoices(['Masculino', 'Feminino'])
        });
    }

    async cpfStep(step){
        step.values.gender = step.result;
        const msg = 'Preciso dos números do teu CPF.';
        return await step.prompt(CPF_PROMPT, msg); 
    }

    async cepStep(step){
        step.values.cpf = step.result;
        const msg = 'Informe o CEP de onde você mora.';
        return await step.prompt(CEP_PROMPT,msg);
    }
    async birthdayStep(step){
        // recuperando as informações através cep informado pelo usuário no passo anterior
        step.values.cep = step.result;
        let result = await axios.get(`https://viacep.com.br/ws/${step.values.cep}/json/`);
        // inserindo as informações recuperadas no people object
        people.locale = result.data.localidade;
        people.uf     = result.data.uf;

        const msg = 'Quala data do seu Aniversário?';
        return await step.prompt(BIRTHDAY_PROMPT,msg);
    }

    async confirmStep(step){

        people.name     = step.values.name; 
        people.age      = step.values.age;           
        people.gender   = step.values.gender;
        people.cpf      = step.values.cpf;
        people.cep      = step.values.cep;
        people.birthday = step.result;
        
        return await step.prompt(CONFIRM_PROMPT,
            `Seu nome é ${people.name}, você nasceu no dia ${people.birthday[0].value}, e o seu gênero é ${people.gender.value}.
             Seu CPF é ${people.cpf}, e você reside na cidade ${people.locale}-${people.uf}.
             Seja bem-vindo! (emoji)`, ['yes', 'no']);     
    }

    async finalStep(step){
        return await step.replaceDialog('MainDialog');
    }
    // Verifica só valores inteiros a partir de 1
    async ageValidator(promptContext){
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0;
    }
    // Verifica a entrada de um CPF contendo apenas 8 dígitos
    async cpfValidator(promptContext){
        const regexCPF1 = /(\d{3}.\d{3}.\d{3}-\d{2})/; 
        const regexCPF2 = /(\d{11})/; 

        const result1 = regexCPF1.test(promptContext.recognized.value);
        const result2 = regexCPF2.test(promptContext.recognized.value);
        
        if(result1 == true){
           return true;
        } else if(result2 == true){
           return true;
        } else {
            const msg = `O teu CEP deve conter apenas 8 dígitos com ou sem caracteres especiais`;
            await promptContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
            return false;
        }
    }
    // Verifica se o endereço do CEP é válido, se for válido retorna positivo ou falso caso contrário.
    async cepValidator(promptContext){
        const regexCep1 = /(\d{5}-\d{3})/;
        const regexCep2 = /(\d{5}\d{3})/; 
        
        const result1 = regexCep1.test(promptContext.recognized.value);
        const result2 = regexCep2.test(promptContext.recognized.value);
        
        if(result1 == true){
           return true;
        } else if(result2 == true){
           return true;
        } else {
            const msg = `O teu CEP deve conter apenas 8 dígitos com ou sem caracteres especiais`;
            await promptContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
            return false;
        }
        /*return await this.validatorRegex(/(\d{5}-\d{3})/,/(\d{5}\d{3})/);*/ 
    }

    async dateTimeValidator(promptContext) {
        if (promptContext.recognized.succeeded) {
            // Extração da Data
            const timex = promptContext.recognized.value[0].timex.split('T')[0];
            return new TimexProperty(timex).types.has('definite');
        }
        return false;
    }
    
    // Funcão para validar todas as expressões regex
    /*async validatorRegex(regexParam1, regexParam2){
        const result1 = regexParam1.test(promptContext.recognized.value);
        const result2 = regexParam2.test(promptContext.recognized.value);
        
        if(result1 == true){
           return true;
        } else if(result2 == true){
           return true;
        } else {
            const msg = `O teu CEP deve conter apenas 8 dígitos com ou sem caracteres especiais`;
            await promptContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
            return false;
        } 
    }*/
}

module.exports.RegistrationDialog = RegistrationDialog;


// formatar saídas 
