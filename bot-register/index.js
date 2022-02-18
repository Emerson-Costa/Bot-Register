/**
 * Name: Emerson J S Costa
 * Description: POC 1 Compass UOL
 * Project: Fluxo de Cadastro 
 */

 const path = require('path');

 const ENV_FILE = path.join(__dirname, '.env');
 require('dotenv').config({ path: ENV_FILE });
 
 const restify = require('restify');
 
 const {
     CloudAdapter,
     ConfigurationServiceClientCredentialFactory,
     ConversationState,
     createBotFrameworkAuthenticationFromConfiguration,
     InputHints,
     MemoryStorage,
     UserState
 } = require('botbuilder');
 
 // importando os bots de diálogo
 const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');
 const { MainDialog }         = require('./dialogs/mainDialog');
 
 const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
     MicrosoftAppId: process.env.MicrosoftAppId,
     MicrosoftAppPassword: process.env.MicrosoftAppPassword,
     MicrosoftAppType: process.env.MicrosoftAppType,
     MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
 });
 
 const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
 
 const adapter = new CloudAdapter(botFrameworkAuthentication);
 
 const onTurnErrorHandler = async (context, error) => {
     console.error(`\n [onTurnError] unhandled error: ${ error }`);
     await context.sendTraceActivity(
         'OnTurnError Trace',
         `${ error }`,
         'https://www.botframework.com/schemas/error',
         'TurnError'
     );
     let onTurnErrorMessage = 'The bot encountered an error or bug.';
     await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
     onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
     await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
     await conversationState.delete(context);
 };
 
 adapter.onTurnError = onTurnErrorHandler;
 
 // Registros de Memória.
 const memoryStorage = new MemoryStorage();
 const conversationState = new ConversationState(memoryStorage);
 const userState = new UserState(memoryStorage);
 
 // Configuração externa do Luis no projeto.
 const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
 const luisConfig = { applicationId: LuisAppId, endpointKey: LuisAPIKey, endpoint: `https://${ LuisAPIHostName }` };
 
 // Criação do diálogo principal.
 const dialog = new MainDialog(userState, luisConfig);
 const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);
 
 // Criação do servidor HTTP.
 const server = restify.createServer();
 server.use(restify.plugins.bodyParser());
 
 server.listen(process.env.port || process.env.PORT || 3978, function() {
     console.log(`\n${ server.name } listening to ${ server.url }`);
     console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
     console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
 });
 
 // Rotas.
 server.post('/api/messages', async (req, res) => {
     await adapter.process(req, res, (context) => bot.run(context));
 });
 
 // aguardando as solicitações para a atualização de streaming.
 server.on('upgrade', async (req, socket, head) => {
     const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
     streamingAdapter.onTurnError = onTurnErrorHandler;
     await streamingAdapter.process(req, socket, head, (context) => bot.run(context));
 });
 