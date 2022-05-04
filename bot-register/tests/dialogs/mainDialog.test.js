const { MemoryStorage, UserState } = require('botbuilder');
//const { TextPrompt } = require('botbuilder-dialogs');
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const assert = require('assert');

const botMessages = require('../../dialogs/messages');
const { RegistrationRecognizer } = require('../../dialogs/registrationRecognizer');
const { MainDialog } = require('../../dialogs/mainDialog');
const { TextPrompt } = require('botbuilder-dialogs');


// Criando uma classe mock do buzzRecognizer
class MockRecognizer extends RegistrationRecognizer {
    constructor(isConfigured, mockResult) {
        super(isConfigured);
        this.isLuisConfigured = isConfigured;
        this.mockResult = mockResult;
    }

    async executeLuisQuery(context) {
        return this.mockResult;
    }

    get isConfigured() {
        return (this.isLuisConfigured);
    }

}

/*class MockMainDialogPrompt extends MainDialog {

    constructor() {
        super('mainDialog');
    }

    async beginDialog(dc, option){
        dc.dialogs.add(new TextPrompt(`MockMainDialog`));
        return await dc.prompt('MockMainDialog', { prompt: `${ this.id } mock invoked`});
    }

};*/

describe('MainDialog', () => {

    // Cada caso  'it' é um teste em um determinado fluxo de diálogo do bot.
    it('Apresentação do Bot', async () => {
        const mockRecognizer = new MockRecognizer(true);

        // Registros de Memória.
        const memoryStorage = new MemoryStorage();
        // const conversationState = new ConversationState(memoryStorage);
        const userState = new UserState(memoryStorage);
        
        const sut = new MainDialog(userState, mockRecognizer);
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()])
        
        let reply = await client.sendActivity('Olá');
        assert.strictEqual(reply.text, botMessages.messages.greeting);

    });

});