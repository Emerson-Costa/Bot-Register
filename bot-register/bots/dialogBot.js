/**
 * Name: Emerson J S Costa
 * Description: POC 1 Compass UOL
 * Project: Fluxo de Cadastro 
 */

 const { ActivityHandler } = require('botbuilder');

 class DialogBot extends ActivityHandler {
    
     constructor(conversationState, userState, dialog) {
         super();
 
         if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
         if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
         if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
 
         this.conversationState = conversationState;
         this.userState         = userState;
         this.dialog            = dialog;
         this.dialogState       = this.conversationState.createProperty('DialogState');
 
         this.onMessage(async (context, next) => {
             console.log('Running dialog with Message Activity.');
             // execution of dialog in ths class. 
             await this.dialog.run(context, this.dialogState);
             await next();
         });
 
         this.onDialog(async (context, next) => {
             await this.conversationState.saveChanges(context, false);
             await this.userState.saveChanges(context, false);
             await next();
         });
     }
 }
 
 module.exports.DialogBot = DialogBot;
 