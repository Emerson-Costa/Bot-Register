const {RegistrationDialog} = require('./registrationDialog');

/**@module insert - Importação do módulo de mensagem da aplicação*/
const insert = require('./messages');

const {
    WaterfallDialog,
    TextPrompt,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
} = require('botbuilder-dialogs');

const {InputHints, UserState} = require('botbuilder');
const {RegistrationRecognizer} = require('./registrationRecognizer');

/**
 *  Tag para escolha de opção via prompt
 *  @type {string}
 */
const OPTION_PROMPT    = 'OPTION_PROMPT'    ;

/**
 *  Tag para criação de uma casacata de diálogo.
 *  @type {string}
 */
const WATERFALL_DIALOG = 'WATERFALL_DIALOG' ;

/**
 *  Tag para salvar o estado de usuário
 *  @type {string}
 */
const USER_PROFILE     = 'USER_PROFILE'     ;

/**
 * Classe principal onde fará o acesso a outros compenentes do sistema.
 * @class
 */
class MainDialog extends ComponentDialog {

    /**
     * @param {*} userState 
     * @param {*} luisConfig
     */
    constructor(userState, luisConfig){
        super('MainDialog');

        /**
         * Instância dos serviços do Luis.
         * @type {InstanceType} */
        this.registrationRecognizer = new RegistrationRecognizer(luisConfig);

        /**
         * Instância da classe de registro de diálogo.
         * @type {InstanceType} */
        this.registrationDialog = new RegistrationDialog(luisConfig);

        /**
         * Instância do estado de usuário.
         * @type {UserState} */
        this.userProfile = userState.createProperty(USER_PROFILE);
        
        this.addDialog(new TextPrompt(OPTION_PROMPT))
            .addDialog(this.registrationDialog)
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG,[
            this.indiceStep.bind(this),
            this.optionStep.bind(this),
            this.finalStep.bind(this)
        ]));
        
        /**
         * Aqui será marcado a ID do início de um diálogo.
         * @type {string}
         */
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

    async indiceStep(step){
        return await step.prompt(OPTION_PROMPT, insert.messages.greeting);
    }
    
    async optionStep(step){ 

        /**
         * Recebe uma promessa referente ao contexto buscado no serviço do Luis.
         * @type {Promise}
         */
        const op = await this.registrationRecognizer.executeQuery(step.context);

        if( this.registrationRecognizer.getOption(op) != 'IncluirRegistro' ){
            await step.context.sendActivity(insert.messages.sorry, insert.messages.sorry, InputHints.IgnoringInput);
        } else {
            return await step.beginDialog('RegistrationDialog');
        }
        return await step.next();
    }

    async finalStep(step){
       return await step.replaceDialog(this.initialDialogId);
    }
}

module.exports.MainDialog = MainDialog;