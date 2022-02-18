const {RegistrationDialog} = require('./registrationDialog');
// Importando as mensagens para o uso no prompt.
const {Messages} = require('./messages');

const {
    WaterfallDialog,
    TextPrompt,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
} = require('botbuilder-dialogs');

const {InputHints} = require('botbuilder');
const {RegistrationRecognizer} = require('./registrationRecognizer');

const OPTION_PROMPT    = 'OPTION_PROMPT'    ;
const WATERFALL_DIALOG = 'WATERFALL_DIALOG' ;
const USER_PROFILE     = 'USER_PROFILE'     ;

class MainDialog extends ComponentDialog {
    constructor(userState, luisConfig){
        super('MainDialog');
        
        this.registrationRecognizer = new RegistrationRecognizer(luisConfig);
        this.registrationDialog = new RegistrationDialog(luisConfig);
        this.userProfile = userState.createProperty(USER_PROFILE);
        this.promptMessage = new Messages();
        
        this.addDialog(new TextPrompt(OPTION_PROMPT))
            .addDialog(this.registrationDialog)
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG,[
            this.indiceStep.bind(this),
            this.optionStep.bind(this),
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

    async indiceStep(step){
        return await step.prompt(OPTION_PROMPT, this.promptMessage.greeting());
    }
    
    async optionStep(step){ 
        const op = await this.registrationRecognizer.executeQuery(step.context);
        if( this.registrationRecognizer.getOption(op) != 'IncluirRegistro' ){
            await step.context.sendActivity(this.promptMessage.sorry(), this.promptMessage.sorry(), InputHints.IgnoringInput);
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
