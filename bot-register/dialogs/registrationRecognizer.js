const {LuisRecognizer} = require('botbuilder-ai');

class RegistrationRecognizer {
    constructor(luisConfig){
        const luisIsConfigured = luisConfig && luisConfig.applicationId && luisConfig.endpointKey && luisConfig.endpoint;
        if(luisIsConfigured){
            const recognizerOptions = {apiVersion: 'v3'};
            this.luisRecognize = new LuisRecognizer(luisConfig,recognizerOptions);
        }
    }

    async executeQuery(context){
        return await this.luisRecognize.recognize(context);
    }

    getOption(option){
        return LuisRecognizer.topIntent(option);
    }
   
    async getEntities(context){
        const result = await this.luisRecognize.recognize( step.context );
        return result;
    }
}

module.exports.RegistrationRecognizer = RegistrationRecognizer;