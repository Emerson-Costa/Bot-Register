<style>
    tam{
         font-size: 90%
    }

    colortype{
        color: yellow
    }

    fonttype{
        ont-family: Gill Sans Extrabold, sans-serif
    }
</style>

# botRegister
<fonttype>
<p>
    &nbsp;&nbsp;&nbsp;&nbsp;Projeto Simples feito com o Bot Framework da Microsoft, o bot realiza o cadastro do usuário no sistema e utiliza o LUIS,
    que está incluso nos serviços cognitivos da Azure, para fazer o reconhecimento das intenções do usuário utilizando entidades
    para fazer a correção das inputs, caso o usuário informe alguma input incorreta.
</p>

# Como Executar?

<b>1. Clone o repositório na sua máquina e execute o comando</b> <i><colortype>npm init</colortype></i>.

<b>2. Configure o Luis com o arquivo com o modelo 'RegisterFlow.json' que se encontra no diretório 'cognitiveModels'.</br>
   &nbsp;&nbsp;&nbsp;&nbsp;<tam>-> Configurando o modelo no LUIS <a href='https://docs.microsoft.com/pt-br/azure/bot-service/language-generation/bot-builder-howto-use-lg-templates?view=azure-bot-service-4.0&tabs=cs#add-luis-to-your-bot'>Clique aqui para ter o acesso à página</a>.</b></tam>

<b>3. Realize o download do emulador para testar o projeto</br>
   &nbsp;&nbsp;&nbsp;&nbsp;-> <tam>Link para download do emulador: <a href='https://github.com/Microsoft/BotFramework-Emulator/blob/master/README.md'>Clique aqui para ter o acesso à página</a>.</br></tam>
   &nbsp;&nbsp;&nbsp;&nbsp;-> <tam>Link da Documentação para a execução do emulador: <a href='https://docs.microsoft.com/pt-br/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0&tabs=csharp'>Clique aqui para ter o acesso à página</a>.</b></tam>

<b>4. execute o projeto com o comando</b> <i><colortype>npm start</colortype></i> <b>ou</b> <i><colortype>yarn start</olortype></i><b>.</b>

 * ##### Documentação do SDK do Bot framework: <a href='https://docs.microsoft.com/pt-br/azure/bot-service/index-bf-sdk?view=azure-bot-service-4.0'>Clique aqui para ter o acesso à página</a>
</fonttype>