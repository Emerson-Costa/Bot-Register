class Messages {
    constructor(){}
    // Mensagens de Inicio do Diálogo.
    greeting            = () => "O que eu posso fazer por você?";
    sorry               = () => "Desculpe, por enquanto eu só fui programado para fazer registros!";
    // Mensagens do Fluxo de Diálogo de Registro.
    dialogName          = () => "Por favor informe o seu nome.";
    dialogAge           = () => "Agora eu preciso que informe a sua idade.";
    dialogGender        = () => "Qual é o seu gênero?";
    dialogCpf           = () => "Preciso do Número do seu CPF.";
    dialogCep           = () => "Informe o CEP de onde você mora.";
    dialogBirthday      = () => "Qual é a data do seu Aniversário?";
    dialogConfirm       = () => "Os dados acima estão corretos?";
    dialogWellcome      = () => "Seja bem-vindo! :D"
    // Mensagens de erros do fluxo de diálogo de Registro
    errorAge            = () => "Por favor, preciso que você informe corretamente a sua idade.";
    errorCpf            = () => "O seu CPF deve conter apenas 8 dígitos com ou sem caracteres especiais";
    errorCep            = () => "O seu CEP deve conter apenas 8 dígitos com ou sem caracteres especiais";
    errorBirthday       = () => "A data informada não está correta, utilize o formato XX-XX-XXXX ou XX/XX/XXXX";
    // Método de saída personalizadas com as informações do fluxo de diálogo de registro
    peopleInfor = (name, birthday, gender, cpf, locale, uf) => `Seu nome é ${name}, você nasceu no dia ${birthday}, seu gênero é ${gender}.\n\n Seu CPF é ${cpf}, você reside na cidade de ${locale}-${uf}.`;
}
module.exports.Messages = Messages;
