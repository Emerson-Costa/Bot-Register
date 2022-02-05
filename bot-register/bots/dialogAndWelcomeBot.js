/**
 * Name: Emerson J S Costa
 * Description: POC 1 Compass UOL
 * Project: Fluxo de Cadastro 
 */
 const { CardFactory } = require('botbuilder-core');
 const { DialogBot } = require('./dialogBot');
 const WelcomeCard = require('../resources/welcomeCard.json');
 
 class DialogAndWelcomeBot extends DialogBot {
     constructor(conversationState, userState, dialog) {
         super(conversationState, userState, dialog);
 
         this.onMembersAdded(async (context, next) => {
             const membersAdded = context.activity.membersAdded;
             for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                 if (membersAdded[cnt].id !== context.activity.recipient.id) {
                     const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                     await context.sendActivity({ attachments: [welcomeCard] });
                     await dialog.run(context, conversationState.createProperty('DialogState'));
                 }
             }
             await next();
         });
     }
 }
 
 module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
 