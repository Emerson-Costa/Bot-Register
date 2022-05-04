const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const assert = require('assert');

const botMessages = require('../../dialogs/messages');
const { RegistrationRecognizer } = require('../../dialogs/registrationRecognizer');
const { RegistrationDialog } = require('../../dialogs/registrationDialog');

// Criando uma classe mock do buzzRecognizer
 /*class MockRecognizer extends RegistrationRecognizer {
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

} */

// Métodos para o testes
const hiAndname = async (client) => {
    reply = await client.sendActivity('Olá');
    assert.strictEqual(reply.text, botMessages.messages.dialogName);

    reply = await client.sendActivity('Emerson');
    assert.strictEqual(reply.text, botMessages.messages.dialogAge);

    reply = await client.sendActivity('36');
}

describe('RegistrationDialog', () => {

    //beforeEach

    it('Informação do nome', async () => {

        // Passando aqui os parametros do Luis
        const luisConfig = { 
            applicationId: '4112b55a-5dfa-4baf-9253-d0e85954c0de', 
            endpointKey: '3f3b70e75a62431cbbeede5a8c7a9ed7', 
            endpoint: `https://australiaeast.api.cognitive.microsoft.com/` 
        };

        const registrationRecognizer = new RegistrationRecognizer(luisConfig);
        const sut = new RegistrationDialog(registrationRecognizer);
        // sut.registrationRecognizer  
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()])

        await hiAndname(client);
        
    });

});