const {RegistrationDialog} = require('./registrationDialog');

const {
    WaterfallDialog,
    TextPrompt,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
} = require('botbuilder-dialogs');

const {InputHints} = require('botbuilder');
const {LuisRecognizer} = require('botbuilder-ai');


const OPTION_PROMPT    = 'OPTION_PROMPT'    ;
const WATERFALL_DIALOG = 'WATERFALL_DIALOG' ;
const USER_PROFILE     = 'USER_PROFILE'     ;


class MainDialog extends ComponentDialog {
    constructor(userState, luisConfig){
        super('MainDialog');
        
        this.registrationDialog = new RegistrationDialog('RegistrationDialog');

        const luisIsConfigured = luisConfig && luisConfig.applicationId && luisConfig.endpointKey && luisConfig.endpoint;
        if(luisIsConfigured){
            const recognizerOptions = {apiVersion: 'v3'};
            this.luisRecognize = new LuisRecognizer(luisConfig,recognizerOptions);
        }
    
        this.userProfile = userState.createProperty(USER_PROFILE);
        
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
         const msg = 'O que eu posso fazer por você?'
         return await step.prompt(OPTION_PROMPT, msg );
    }

    async optionStep(step){ 
        const op = await this.luisRecognize.recognize( step.context );
        if(LuisRecognizer.topIntent(op) != 'IncluirRegistro' ){
            const msg = `Desculpe, por enquanto eu só fui programado para fazer registros!`;
            await step.context.sendActivity(msg, msg, InputHints.IgnoringInput);
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
