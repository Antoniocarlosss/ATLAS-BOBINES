document.addEventListener("DOMContentLoaded", ()=>{

const welcome = document.getElementById("welcomeScreen")
const mainPanel = document.getElementById("mainPanel")
const nomeInput = document.getElementById("nomeUsuarioInput")
const idiomaSelect = document.getElementById("idiomaSelect")
const entrar = document.getElementById("entrarBtn")
const resetBtn = document.getElementById("resetUser")
const nomeErro = document.getElementById("nomeErro")
const calculatorChoice = document.getElementById("calculatorChoice")
const bancoTesteSection = document.getElementById("bancoTesteSection")
const bobinaCalculator = document.getElementById("bobinaCalculator")
const agropainelCalculator = document.getElementById("agropainelCalculator")
const abrirBobinaBtn = document.getElementById("abrirBobinaBtn")
const abrirAgropainelBtn = document.getElementById("abrirAgropainelBtn")
const voltarBobinaBtn = document.getElementById("voltarBobinaBtn")
const voltarAgropainelBtn = document.getElementById("voltarAgropainelBtn")
const idiomaAtualSelect = document.getElementById("idiomaAtualSelect")
const labelIdiomaAtual = document.getElementById("labelIdiomaAtual")

let nome = localStorage.getItem("nomeUsuario")
let idioma = localStorage.getItem("idiomaUsuario") || "pt"

async function salvarUsuarioFirebase(){
    if(!window.AtlasFirebase || !nome) return

    try{
        await window.AtlasFirebase.salvarUsuario({ nome, idioma })
    }catch(error){
        console.error("Erro ao salvar usuario no Firebase:", error)
    }
}

const textos = {
    pt:{escolha:"Escolha a calculadora",titulo:"Calculadora de Bobina",bobina:"Calculadora Bobina",bobinaSub:"Calculo padrao de bobinas",agro:"Calculadora Agropainel",agroSub:"Espessura fixa 0.60 mm | Interno 200",idioma:"Idioma",largura:"Largura da bobina externa (cm)",agroLargura:"Largura da aba (cm)",espessura:"Espessura da chapa (mm)",velocidade:"Velocidade da maquina (m/min)",falta:"Falta para acabar: ",tempo:"Falta ",acaba:"Provavelmente acaba as: ",trocar:"Trocar usuario",voltar:"Voltar para opcoes",primeiro:"Primeiro acesso",bomDia:"Bom dia",boaTarde:"Boa tarde",boaNoite:"Boa noite",ultimo:"Ultimo acesso"},
    en:{escolha:"Choose the calculator",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil calculation",agro:"Agropanel Calculator",agroSub:"Fixed thickness 0.60 mm | Core 200",idioma:"Language",largura:"Outer coil width (cm)",agroLargura:"Flap width (cm)",espessura:"Sheet thickness (mm)",velocidade:"Machine speed (m/min)",falta:"Remaining: ",tempo:"Time left ",acaba:"Probably finishes at: ",trocar:"Change user",voltar:"Back to options",primeiro:"First access",bomDia:"Good morning",boaTarde:"Good afternoon",boaNoite:"Good evening",ultimo:"Last access"},
    hi:{escolha:"à¤•à¥ˆà¤²à¤•à¥à¤²à¥‡à¤Ÿà¤° à¤šà¥à¤¨à¥‡à¤‚",titulo:"à¤•à¥‰à¤‡à¤² à¤•à¥ˆà¤²à¤•à¥à¤²à¥‡à¤Ÿà¤°",bobina:"à¤•à¥‰à¤‡à¤² à¤•à¥ˆà¤²à¤•à¥à¤²à¥‡à¤Ÿà¤°",bobinaSub:"à¤®à¤¾à¤¨à¤• à¤•à¥‰à¤‡à¤² à¤—à¤£à¤¨à¤¾",agro:"à¤à¤—à¥à¤°à¥‹à¤ªà¥ˆà¤¨à¤² à¤•à¥ˆà¤²à¤•à¥à¤²à¥‡à¤Ÿà¤°",agroSub:"à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤®à¥‹à¤Ÿà¤¾à¤ˆ 0.60 mm | à¤…à¤‚à¤¦à¤° 200",idioma:"à¤­à¤¾à¤·à¤¾",largura:"à¤¬à¤¾à¤¹à¤°à¥€ à¤•à¥‰à¤‡à¤² à¤šà¥Œà¤¡à¤¼à¤¾à¤ˆ (cm)",agroLargura:"à¤«à¥à¤²à¥ˆà¤ª à¤šà¥Œà¤¡à¤¼à¤¾à¤ˆ (cm)",espessura:"à¤¶à¥€à¤Ÿ à¤®à¥‹à¤Ÿà¤¾à¤ˆ (mm)",velocidade:"à¤®à¤¶à¥€à¤¨ à¤—à¤¤à¤¿ (m/min)",falta:"à¤¬à¤¾à¤•à¥€: ",tempo:"à¤¸à¤®à¤¯ à¤¬à¤¾à¤•à¥€ ",acaba:"à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤¸à¤®à¤¾à¤ªà¥à¤¤à¤¿: ",trocar:"à¤¯à¥‚à¤œà¤¼à¤° à¤¬à¤¦à¤²à¥‡à¤‚",voltar:"à¤µà¤¿à¤•à¤²à¥à¤ªà¥‹à¤‚ à¤ªà¤° à¤µà¤¾à¤ªà¤¸",primeiro:"à¤ªà¤¹à¤²à¥€ à¤¬à¤¾à¤°",bomDia:"à¤¸à¥à¤ªà¥à¤°à¤­à¤¾à¤¤",boaTarde:"à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°",boaNoite:"à¤¶à¥à¤­ à¤°à¤¾à¤¤à¥à¤°à¤¿",ultimo:"à¤…à¤‚à¤¤à¤¿à¤® à¤ªà¥à¤°à¤µà¥‡à¤¶"},
    bn:{escolha:"à¦•à§à¦¯à¦¾à¦²à¦•à§à¦²à§‡à¦Ÿà¦° à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨",titulo:"à¦•à§Ÿà§‡à¦² à¦•à§à¦¯à¦¾à¦²à¦•à§à¦²à§‡à¦Ÿà¦°",bobina:"à¦•à§Ÿà§‡à¦² à¦•à§à¦¯à¦¾à¦²à¦•à§à¦²à§‡à¦Ÿà¦°",bobinaSub:"à¦¸à§à¦Ÿà§à¦¯à¦¾à¦¨à§à¦¡à¦¾à¦°à§à¦¡ à¦•à§Ÿà§‡à¦² à¦—à¦£à¦¨à¦¾",agro:"à¦…à§à¦¯à¦¾à¦—à§à¦°à§‹à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦•à§à¦¯à¦¾à¦²à¦•à§à¦²à§‡à¦Ÿà¦°",agroSub:"à¦¸à§à¦¥à¦¿à¦° à¦ªà§à¦°à§à¦¤à§à¦¬ 0.60 mm | à¦­à¦¿à¦¤à¦° 200",idioma:"à¦­à¦¾à¦·à¦¾",largura:"à¦¬à¦¾à¦‡à¦°à§‡à¦° à¦•à§Ÿà§‡à¦² à¦ªà§à¦°à¦¸à§à¦¥ (cm)",agroLargura:"à¦«à§à¦²à§à¦¯à¦¾à¦ª à¦ªà§à¦°à¦¸à§à¦¥ (cm)",espessura:"à¦¶à¦¿à¦Ÿà§‡à¦° à¦ªà§à¦°à§à¦¤à§à¦¬ (mm)",velocidade:"à¦®à§‡à¦¶à¦¿à¦¨à§‡à¦° à¦—à¦¤à¦¿ (m/min)",falta:"à¦¬à¦¾à¦•à¦¿: ",tempo:"à¦¸à¦®à§Ÿ à¦¬à¦¾à¦•à¦¿ ",acaba:"à¦¸à¦®à§à¦­à¦¬à¦¤ à¦¶à§‡à¦· à¦¹à¦¬à§‡: ",trocar:"à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à¦•à¦¾à¦°à§€ à¦¬à¦¦à¦²à¦¾à¦¨",voltar:"à¦¬à¦¿à¦•à¦²à§à¦ªà§‡ à¦«à¦¿à¦°à§à¦¨",primeiro:"à¦ªà§à¦°à¦¥à¦® à¦ªà§à¦°à¦¬à§‡à¦¶",bomDia:"à¦¸à§à¦ªà§à¦°à¦­à¦¾à¦¤",boaTarde:"à¦¶à§à¦­ à¦…à¦ªà¦°à¦¾à¦¹à§à¦¨",boaNoite:"à¦¶à§à¦­ à¦°à¦¾à¦¤à§à¦°à¦¿",ultimo:"à¦¶à§‡à¦· à¦ªà§à¦°à¦¬à§‡à¦¶"},
    te:{escolha:"à°•à°¾à°²à±à°•à±à°¯à±à°²à±‡à°Ÿà°°à± à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿",titulo:"à°•à°¾à°¯à°¿à°²à± à°•à°¾à°²à±à°•à±à°¯à±à°²à±‡à°Ÿà°°à±",bobina:"à°•à°¾à°¯à°¿à°²à± à°•à°¾à°²à±à°•à±à°¯à±à°²à±‡à°Ÿà°°à±",bobinaSub:"à°ªà±à°°à°¾à°®à°¾à°£à°¿à°• à°•à°¾à°¯à°¿à°²à± à°²à±†à°•à±à°•à°¿à°‚à°ªà±",agro:"à°…à°—à±à°°à±‹à°ªà±à°¯à°¾à°¨à±†à°²à± à°•à°¾à°²à±à°•à±à°¯à±à°²à±‡à°Ÿà°°à±",agroSub:"à°¸à±à°¥à°¿à°° à°®à°‚à°¦à°‚ 0.60 mm | à°²à±‹à°ªà°²à°¿ 200",idioma:"à°­à°¾à°·",largura:"à°¬à°¯à°Ÿà°¿ à°•à°¾à°¯à°¿à°²à± à°µà±†à°¡à°²à±à°ªà± (cm)",agroLargura:"à°«à±à°²à°¾à°ªà± à°µà±†à°¡à°²à±à°ªà± (cm)",espessura:"à°·à±€à°Ÿà± à°®à°‚à°¦à°‚ (mm)",velocidade:"à°¯à°‚à°¤à±à°° à°µà±‡à°—à°‚ (m/min)",falta:"à°®à°¿à°—à°¿à°²à°¿à°‚à°¦à°¿: ",tempo:"à°®à°¿à°—à°¿à°²à°¿à°¨ à°¸à°®à°¯à°‚ ",acaba:"à°…à°‚à°šà°¨à°¾ à°®à±à°—à°¿à°‚à°ªà±: ",trocar:"à°µà°¿à°¨à°¿à°¯à±‹à°—à°¦à°¾à°°à± à°®à°¾à°°à±à°šà°‚à°¡à°¿",voltar:"à°Žà°‚à°ªà°¿à°•à°²à°•à± à°¤à°¿à°°à°¿à°—à°¿",primeiro:"à°®à±Šà°¦à°Ÿà°¿ à°ªà±à°°à°µà±‡à°¶à°‚",bomDia:"à°¶à±à°­à±‹à°¦à°¯à°‚",boaTarde:"à°¶à±à°­ à°®à°§à±à°¯à°¾à°¹à±à°¨à°‚",boaNoite:"à°¶à±à°­ à°°à°¾à°¤à±à°°à°¿",ultimo:"à°šà°¿à°µà°°à°¿ à°ªà±à°°à°µà±‡à°¶à°‚"},
    mr:{escolha:"à¤•à¥…à¤²à¥à¤•à¥à¤¯à¥à¤²à¥‡à¤Ÿà¤° à¤¨à¤¿à¤µà¤¡à¤¾",titulo:"à¤•à¥‰à¤‡à¤² à¤•à¥…à¤²à¥à¤•à¥à¤¯à¥à¤²à¥‡à¤Ÿà¤°",bobina:"à¤•à¥‰à¤‡à¤² à¤•à¥…à¤²à¥à¤•à¥à¤¯à¥à¤²à¥‡à¤Ÿà¤°",bobinaSub:"à¤®à¤¾à¤¨à¤• à¤•à¥‰à¤‡à¤² à¤—à¤£à¤¨à¤¾",agro:"à¤…à¥…à¤—à¥à¤°à¥‹à¤ªà¥…à¤¨à¥‡à¤² à¤•à¥…à¤²à¥à¤•à¥à¤¯à¥à¤²à¥‡à¤Ÿà¤°",agroSub:"à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤œà¤¾à¤¡à¥€ 0.60 mm | à¤†à¤¤ 200",idioma:"à¤­à¤¾à¤·à¤¾",largura:"à¤¬à¤¾à¤¹à¥‡à¤°à¥€à¤² à¤•à¥‰à¤‡à¤² à¤°à¥à¤‚à¤¦à¥€ (cm)",agroLargura:"à¤«à¥à¤²à¥…à¤ª à¤°à¥à¤‚à¤¦à¥€ (cm)",espessura:"à¤¶à¥€à¤Ÿ à¤œà¤¾à¤¡à¥€ (mm)",velocidade:"à¤®à¤¶à¥€à¤¨ à¤µà¥‡à¤— (m/min)",falta:"à¤¬à¤¾à¤•à¥€: ",tempo:"à¤‰à¤°à¤²à¥‡à¤²à¤¾ à¤µà¥‡à¤³ ",acaba:"à¤¬à¤¹à¥à¤§à¤¾ à¤¸à¤®à¤¾à¤ªà¥à¤¤: ",trocar:"à¤µà¤¾à¤ªà¤°à¤•à¤°à¥à¤¤à¤¾ à¤¬à¤¦à¤²à¤¾",voltar:"à¤ªà¤°à¥à¤¯à¤¾à¤¯à¤¾à¤‚à¤µà¤° à¤ªà¤°à¤¤",primeiro:"à¤ªà¤¹à¤¿à¤²à¤¾ à¤ªà¥à¤°à¤µà¥‡à¤¶",bomDia:"à¤¶à¥à¤­ à¤ªà¥à¤°à¤­à¤¾à¤¤",boaTarde:"à¤¶à¥à¤­ à¤¦à¥à¤ªà¤¾à¤°",boaNoite:"à¤¶à¥à¤­ à¤°à¤¾à¤¤à¥à¤°à¥€",ultimo:"à¤¶à¥‡à¤µà¤Ÿà¤šà¤¾ à¤ªà¥à¤°à¤µà¥‡à¤¶"},
    ta:{escolha:"à®•à®£à®¿à®ªà¯à®ªà®¾à®©à¯ à®¤à¯‡à®°à¯à®µà¯",titulo:"à®•à®¾à®¯à®¿à®²à¯ à®•à®£à®¿à®ªà¯à®ªà®¾à®©à¯",bobina:"à®•à®¾à®¯à®¿à®²à¯ à®•à®£à®¿à®ªà¯à®ªà®¾à®©à¯",bobinaSub:"à®¨à®¿à®²à¯ˆà®¯à®¾à®© à®•à®¾à®¯à®¿à®²à¯ à®•à®£à®•à¯à®•à¯",agro:"à®…à®•à¯à®°à¯‹à®ªà¯‡à®©à®²à¯ à®•à®£à®¿à®ªà¯à®ªà®¾à®©à¯",agroSub:"à®¨à®¿à®²à¯ˆà®¯à®¾à®© à®¤à®Ÿà®¿à®®à®©à¯ 0.60 mm | à®‰à®³à¯à®³à¯‡ 200",idioma:"à®®à¯Šà®´à®¿",largura:"à®µà¯†à®³à®¿à®ªà¯à®ªà¯à®± à®•à®¾à®¯à®¿à®²à¯ à®…à®•à®²à®®à¯ (cm)",agroLargura:"à®ƒà®ªà®¿à®³à®¾à®ªà¯ à®…à®•à®²à®®à¯ (cm)",espessura:"à®¤à®¾à®³à¯ à®¤à®Ÿà®¿à®®à®©à¯ (mm)",velocidade:"à®‡à®¯à®¨à¯à®¤à®¿à®° à®µà¯‡à®•à®®à¯ (m/min)",falta:"à®®à¯€à®¤à®®à¯: ",tempo:"à®®à¯€à®¤à®®à¯à®³à¯à®³ à®¨à¯‡à®°à®®à¯ ",acaba:"à®®à¯à®Ÿà®¿à®¯à¯à®®à¯ à®¨à¯‡à®°à®®à¯: ",trocar:"à®ªà®¯à®©à®°à¯ à®®à®¾à®±à¯à®±à¯",voltar:"à®µà®¿à®°à¯à®ªà¯à®ªà®™à¯à®•à®³à¯à®•à¯à®•à¯ à®¤à®¿à®°à¯à®®à¯à®ªà¯",primeiro:"à®®à¯à®¤à®²à¯ à®…à®£à¯à®•à®²à¯",bomDia:"à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯",boaTarde:"à®®à®¤à®¿à®¯ à®µà®£à®•à¯à®•à®®à¯",boaNoite:"à®‡à®°à®µà¯ à®µà®£à®•à¯à®•à®®à¯",ultimo:"à®•à®Ÿà¯ˆà®šà®¿ à®…à®£à¯à®•à®²à¯"},
    ur:{escolha:"Ú©ÛŒÙ„Ú©ÙˆÙ„ÛŒÙ¹Ø± Ù…Ù†ØªØ®Ø¨ Ú©Ø±ÛŒÚº",titulo:"Ú©ÙˆØ§Ø¦Ù„ Ú©ÛŒÙ„Ú©ÙˆÙ„ÛŒÙ¹Ø±",bobina:"Ú©ÙˆØ§Ø¦Ù„ Ú©ÛŒÙ„Ú©ÙˆÙ„ÛŒÙ¹Ø±",bobinaSub:"Ù…Ø¹ÛŒØ§Ø±ÛŒ Ú©ÙˆØ§Ø¦Ù„ Ø­Ø³Ø§Ø¨",agro:"Ø§ÛŒÚ¯Ø±Ùˆ Ù¾ÛŒÙ†Ù„ Ú©ÛŒÙ„Ú©ÙˆÙ„ÛŒÙ¹Ø±",agroSub:"Ù…Ù‚Ø±Ø±Û Ù…ÙˆÙ¹Ø§Ø¦ÛŒ 0.60 mm | Ø§Ù†Ø¯Ø± 200",idioma:"Ø²Ø¨Ø§Ù†",largura:"Ø¨ÛŒØ±ÙˆÙ†ÛŒ Ú©ÙˆØ§Ø¦Ù„ Ú†ÙˆÚ‘Ø§Ø¦ÛŒ (cm)",agroLargura:"ÙÙ„ÛŒÙ¾ Ú†ÙˆÚ‘Ø§Ø¦ÛŒ (cm)",espessura:"Ø´ÛŒÙ¹ Ù…ÙˆÙ¹Ø§Ø¦ÛŒ (mm)",velocidade:"Ù…Ø´ÛŒÙ† Ø±ÙØªØ§Ø± (m/min)",falta:"Ø¨Ø§Ù‚ÛŒ: ",tempo:"ÙˆÙ‚Øª Ø¨Ø§Ù‚ÛŒ ",acaba:"Ù…Ù…Ú©Ù†Û Ø§Ø®ØªØªØ§Ù…: ",trocar:"ØµØ§Ø±Ù ØªØ¨Ø¯ÛŒÙ„ Ú©Ø±ÛŒÚº",voltar:"Ø§Ø®ØªÛŒØ§Ø±Ø§Øª Ù¾Ø± ÙˆØ§Ù¾Ø³",primeiro:"Ù¾ÛÙ„ÛŒ Ø±Ø³Ø§Ø¦ÛŒ",bomDia:"ØµØ¨Ø­ Ø¨Ø®ÛŒØ±",boaTarde:"Ø¢Ø¯Ø§Ø¨",boaNoite:"Ø´Ø¨ Ø¨Ø®ÛŒØ±",ultimo:"Ø¢Ø®Ø±ÛŒ Ø±Ø³Ø§Ø¦ÛŒ"},
    gu:{escolha:"àª•à«‡àª²à«àª•à«àª¯à«àª²à«‡àªŸàª° àªªàª¸àª‚àª¦ àª•àª°à«‹",titulo:"àª•à«‹àª‡àª² àª•à«‡àª²à«àª•à«àª¯à«àª²à«‡àªŸàª°",bobina:"àª•à«‹àª‡àª² àª•à«‡àª²à«àª•à«àª¯à«àª²à«‡àªŸàª°",bobinaSub:"àªªà«àª°àª®àª¾àª£àª­à«‚àª¤ àª•à«‹àª‡àª² àª—àª£àª¤àª°à«€",agro:"àªàª—à«àª°à«‹àªªà«‡àª¨àª² àª•à«‡àª²à«àª•à«àª¯à«àª²à«‡àªŸàª°",agroSub:"àª¨àª¿àª¶à«àªšàª¿àª¤ àªœàª¾àª¡àª¾àªˆ 0.60 mm | àª…àª‚àª¦àª° 200",idioma:"àª­àª¾àª·àª¾",largura:"àª¬àª¾àª¹à«àª¯ àª•à«‹àª‡àª² àªªàª¹à«‹àª³àª¾àªˆ (cm)",agroLargura:"àª«à«àª²à«‡àªª àªªàª¹à«‹àª³àª¾àªˆ (cm)",espessura:"àª¶à«€àªŸ àªœàª¾àª¡àª¾àªˆ (mm)",velocidade:"àª®àª¶à«€àª¨ àª—àª¤àª¿ (m/min)",falta:"àª¬àª¾àª•à«€: ",tempo:"àª¬àª¾àª•à«€ àª¸àª®àª¯ ",acaba:"àª¸àª‚àª­àªµàª¿àª¤ àª…àª‚àª¤: ",trocar:"àªµàªªàª°àª¾àª¶àª•àª°à«àª¤àª¾ àª¬àª¦àª²à«‹",voltar:"àªµàª¿àª•àª²à«àªªà«‹ àªªàª° àªªàª¾àª›àª¾",primeiro:"àªªà«àª°àª¥àª® àªªà«àª°àªµà«‡àª¶",bomDia:"àª¸à«àªªà«àª°àª­àª¾àª¤",boaTarde:"àª¶à«àª­ àª¬àªªà«‹àª°",boaNoite:"àª¶à«àª­ àª°àª¾àª¤à«àª°àª¿",ultimo:"àª›à«‡àª²à«àª²à«‹ àªªà«àª°àªµà«‡àª¶"},
    kn:{escolha:"à²•à³à²¯à²¾à²²à³à²•à³à²²à³‡à²Ÿà²°à³ à²†à²¯à³à²•à³†à²®à²¾à²¡à²¿",titulo:"à²•à²¾à²¯à²¿à²²à³ à²•à³à²¯à²¾à²²à³à²•à³à²²à³‡à²Ÿà²°à³",bobina:"à²•à²¾à²¯à²¿à²²à³ à²•à³à²¯à²¾à²²à³à²•à³à²²à³‡à²Ÿà²°à³",bobinaSub:"à²ªà³à²°à²®à²¾à²£à²¿à²¤ à²•à²¾à²¯à²¿à²²à³ à²²à³†à²•à³à²•à²¾à²šà²¾à²°",agro:"à²…à²—à³à²°à³‹à²ªà³à²¯à²¾à²¨à²²à³ à²•à³à²¯à²¾à²²à³à²•à³à²²à³‡à²Ÿà²°à³",agroSub:"à²¸à³à²¥à²¿à²° à²¦à²ªà³à²ª 0.60 mm | à²’à²³à²—à³† 200",idioma:"à²­à²¾à²·à³†",largura:"à²¹à³Šà²°à²—à²¿à²¨ à²•à²¾à²¯à²¿à²²à³ à²…à²—à²² (cm)",agroLargura:"à²«à³à²²à²¾à²ªà³ à²…à²—à²² (cm)",espessura:"à²¶à³€à²Ÿà³ à²¦à²ªà³à²ª (mm)",velocidade:"à²¯à²‚à²¤à³à²° à²µà³‡à²— (m/min)",falta:"à²¬à²¾à²•à²¿: ",tempo:"à²¬à²¾à²•à²¿ à²¸à²®à²¯ ",acaba:"à²¬à²¹à³à²¶à²ƒ à²®à³à²—à²¿à²¯à³à²µ à²¸à²®à²¯: ",trocar:"à²¬à²³à²•à³†à²¦à²¾à²° à²¬à²¦à²²à²¿à²¸à²¿",voltar:"à²†à²¯à³à²•à³†à²—à²³à²¿à²—à³† à²¹à²¿à²‚à²¦à²¿à²°à³à²—à²¿",primeiro:"à²®à³Šà²¦à²² à²ªà³à²°à²µà³‡à²¶",bomDia:"à²¶à³à²­à³‹à²¦à²¯",boaTarde:"à²¶à³à²­ à²®à²§à³à²¯à²¾à²¹à³à²¨",boaNoite:"à²¶à³à²­ à²°à²¾à²¤à³à²°à²¿",ultimo:"à²•à³Šà²¨à³†à²¯ à²ªà³à²°à²µà³‡à²¶"},
    ml:{escolha:"à´•à´¾àµ½à´•àµà´•àµà´²àµ‡à´±àµà´±àµ¼ à´¤à´¿à´°à´žàµà´žàµ†à´Ÿàµà´•àµà´•àµà´•",titulo:"à´•àµ‹à´¯à´¿àµ½ à´•à´¾àµ½à´•àµà´•àµà´²àµ‡à´±àµà´±àµ¼",bobina:"à´•àµ‹à´¯à´¿àµ½ à´•à´¾àµ½à´•àµà´•àµà´²àµ‡à´±àµà´±àµ¼",bobinaSub:"à´¸àµà´±àµà´±à´¾àµ»à´¡àµ‡àµ¼à´¡àµ à´•àµ‹à´¯à´¿àµ½ à´•à´£à´•àµà´•àµà´•àµ‚à´Ÿàµà´Ÿàµ½",agro:"à´…à´—àµà´°àµ‹à´ªà´¾à´¨àµ½ à´•à´¾àµ½à´•àµà´•àµà´²àµ‡à´±àµà´±àµ¼",agroSub:"à´¸àµà´¥à´¿à´° à´•à´¨à´‚ 0.60 mm | à´…à´•à´¤àµà´¤àµ 200",idioma:"à´­à´¾à´·",largura:"à´ªàµà´±à´¤àµà´¤àµ† à´•àµ‹à´¯à´¿àµ½ à´µàµ€à´¤à´¿ (cm)",agroLargura:"à´«àµà´²à´¾à´ªàµà´ªàµ à´µàµ€à´¤à´¿ (cm)",espessura:"à´·àµ€à´±àµà´±àµ à´•à´¨à´‚ (mm)",velocidade:"à´¯à´¨àµà´¤àµà´° à´µàµ‡à´—à´‚ (m/min)",falta:"à´¬à´¾à´•àµà´•à´¿: ",tempo:"à´¬à´¾à´•àµà´•à´¿ à´¸à´®à´¯à´‚ ",acaba:"à´¸à´¾à´§àµà´¯à´®à´¾à´¯ à´…à´µà´¸à´¾à´¨ à´¸à´®à´¯à´‚: ",trocar:"à´‰à´ªà´¯àµ‹à´•àµà´¤à´¾à´µàµ à´®à´¾à´±àµà´±àµà´•",voltar:"à´“à´ªàµà´·à´¨àµà´•à´³à´¿à´²àµ‡à´•àµà´•àµ à´®à´Ÿà´™àµà´™àµà´•",primeiro:"à´†à´¦àµà´¯ à´ªàµà´°à´µàµ‡à´¶à´¨à´‚",bomDia:"à´¸àµà´ªàµà´°à´­à´¾à´¤à´‚",boaTarde:"à´¶àµà´­ à´‰à´šàµà´šà´¤à´¿à´°à´¿à´žàµà´žàµ",boaNoite:"à´¶àµà´­ à´°à´¾à´¤àµà´°à´¿",ultimo:"à´…à´µà´¸à´¾à´¨ à´ªàµà´°à´µàµ‡à´¶à´¨à´‚"},
    pa:{escolha:"à¨•à©ˆà¨²à¨•à©à¨²à©‡à¨Ÿà¨° à¨šà©à¨£à©‹",titulo:"à¨•à©‹à¨‡à¨² à¨•à©ˆà¨²à¨•à©à¨²à©‡à¨Ÿà¨°",bobina:"à¨•à©‹à¨‡à¨² à¨•à©ˆà¨²à¨•à©à¨²à©‡à¨Ÿà¨°",bobinaSub:"à¨®à¨¿à¨†à¨°à©€ à¨•à©‹à¨‡à¨² à¨—à¨¿à¨£à¨¤à©€",agro:"à¨à¨—à©à¨°à©‹à¨ªà©ˆà¨¨à¨² à¨•à©ˆà¨²à¨•à©à¨²à©‡à¨Ÿà¨°",agroSub:"à¨¨à¨¿à¨¶à¨šà¨¿à¨¤ à¨®à©‹à¨Ÿà¨¾à¨ˆ 0.60 mm | à¨…à©°à¨¦à¨° 200",idioma:"à¨­à¨¾à¨¸à¨¼à¨¾",largura:"à¨¬à¨¾à¨¹à¨°à©€ à¨•à©‹à¨‡à¨² à¨šà©Œà©œà¨¾à¨ˆ (cm)",agroLargura:"à¨«à¨²à©ˆà¨ª à¨šà©Œà©œà¨¾à¨ˆ (cm)",espessura:"à¨¸à¨¼à©€à¨Ÿ à¨®à©‹à¨Ÿà¨¾à¨ˆ (mm)",velocidade:"à¨®à¨¸à¨¼à©€à¨¨ à¨—à¨¤à©€ (m/min)",falta:"à¨¬à¨¾à¨•à©€: ",tempo:"à¨¬à¨¾à¨•à©€ à¨¸à¨®à¨¾à¨‚ ",acaba:"à¨¸à¨¼à¨¾à¨‡à¨¦ à¨®à©à¨•à©°à¨®à¨²: ",trocar:"à¨¯à©‚à¨œà¨¼à¨° à¨¬à¨¦à¨²à©‹",voltar:"à¨šà©‹à¨£à¨¾à¨‚ à¨µà©±à¨² à¨µà¨¾à¨ªà¨¸",primeiro:"à¨ªà¨¹à¨¿à¨²à©€ à¨ªà¨¹à©à©°à¨š",bomDia:"à¨¸à¨¤à¨¿ à¨¸à©à¨°à©€ à¨…à¨•à¨¾à¨²",boaTarde:"à¨¸à¨¼à©à¨­ à¨¦à©à¨ªà¨¹à¨¿à¨°",boaNoite:"à¨¸à¨¼à©à¨­ à¨°à¨¾à¨¤",ultimo:"à¨†à¨–à¨°à©€ à¨ªà¨¹à©à©°à¨š"}
}

Object.assign(textos, {
    hi:{escolha:"Calculator chune",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil hisaab",agro:"Agropanel Calculator",agroSub:"Fixed motai 0.60 mm | Andar 200",idioma:"Bhasha",largura:"Bahari coil chaudai (cm)",agroLargura:"Flap chaudai (cm)",espessura:"Sheet motai (mm)",velocidade:"Machine speed (m/min)",falta:"Baaki: ",tempo:"Samay baaki ",acaba:"Shayad khatam hoga: ",trocar:"User badle",voltar:"Options par wapas",primeiro:"Pehla access",bomDia:"Suprabhat",boaTarde:"Namaste",boaNoite:"Shubh ratri",ultimo:"Aakhri access"},
    bn:{escolha:"Calculator bachun",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil hisab",agro:"Agropanel Calculator",agroSub:"Fixed purutto 0.60 mm | Bhitor 200",idioma:"Bhasha",largura:"Bairer coil prostho (cm)",agroLargura:"Flap prostho (cm)",espessura:"Sheet purutto (mm)",velocidade:"Machine speed (m/min)",falta:"Baki: ",tempo:"Somoy baki ",acaba:"Sesh hobe: ",trocar:"User bodlan",voltar:"Option e phirun",primeiro:"Prothom access",bomDia:"Shuvo sokal",boaTarde:"Shuvo dupur",boaNoite:"Shuvo ratri",ultimo:"Shesh access"},
    te:{escolha:"Calculator enchukondi",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil lekka",agro:"Agropanel Calculator",agroSub:"Fixed mandam 0.60 mm | Lopala 200",idioma:"Bhasha",largura:"Bayata coil vedalpu (cm)",agroLargura:"Flap vedalpu (cm)",espessura:"Sheet mandam (mm)",velocidade:"Machine speed (m/min)",falta:"Migili: ",tempo:"Samayam migili ",acaba:"Mugimpu samayam: ",trocar:"User marchandi",voltar:"Options ki tirigi",primeiro:"Modati access",bomDia:"Shubhodayam",boaTarde:"Shubha madhyanam",boaNoite:"Shubha ratri",ultimo:"Chivari access"},
    mr:{escolha:"Calculator nivda",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil ganana",agro:"Agropanel Calculator",agroSub:"Fixed jadi 0.60 mm | Aat 200",idioma:"Bhasha",largura:"Baheril coil rundi (cm)",agroLargura:"Flap rundi (cm)",espessura:"Sheet jadi (mm)",velocidade:"Machine speed (m/min)",falta:"Baki: ",tempo:"Urlela vel ",acaba:"Sampel: ",trocar:"User badla",voltar:"Options var parat",primeiro:"Pahila access",bomDia:"Shubh prabhat",boaTarde:"Shubh dupar",boaNoite:"Shubh ratri",ultimo:"Shevatcha access"},
    ta:{escolha:"Calculator therndhedungal",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil kanakku",agro:"Agropanel Calculator",agroSub:"Fixed thadiman 0.60 mm | Ulle 200",idioma:"Mozhi",largura:"Velippura coil agalam (cm)",agroLargura:"Flap agalam (cm)",espessura:"Sheet thadiman (mm)",velocidade:"Machine speed (m/min)",falta:"Meetham: ",tempo:"Neram meetham ",acaba:"Mudiyum neram: ",trocar:"User maatru",voltar:"Options ku thirumbu",primeiro:"Mudhal access",bomDia:"Kaalai vanakkam",boaTarde:"Madhya vanakkam",boaNoite:"Iravu vanakkam",ultimo:"Kadaisi access"},
    ur:{escolha:"Calculator muntakhab karein",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil hisab",agro:"Agropanel Calculator",agroSub:"Fixed motai 0.60 mm | Andar 200",idioma:"Zaban",largura:"Bairooni coil chorai (cm)",agroLargura:"Flap chorai (cm)",espessura:"Sheet motai (mm)",velocidade:"Machine speed (m/min)",falta:"Baqi: ",tempo:"Waqt baqi ",acaba:"Khatam hoga: ",trocar:"User tabdeel karein",voltar:"Options par wapas",primeiro:"Pehli rasai",bomDia:"Subah bakhair",boaTarde:"Adaab",boaNoite:"Shab bakhair",ultimo:"Aakhri access"},
    gu:{escolha:"Calculator pasand karo",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil ganatari",agro:"Agropanel Calculator",agroSub:"Fixed jadayi 0.60 mm | Andar 200",idioma:"Bhasha",largura:"Bahya coil paholai (cm)",agroLargura:"Flap paholai (cm)",espessura:"Sheet jadayi (mm)",velocidade:"Machine speed (m/min)",falta:"Baki: ",tempo:"Samay baki ",acaba:"Ant samay: ",trocar:"User badlo",voltar:"Options par pacha",primeiro:"Pratham access",bomDia:"Suprabhat",boaTarde:"Shubh bapor",boaNoite:"Shubh ratri",ultimo:"Chello access"},
    kn:{escolha:"Calculator ayke madi",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil lekkachara",agro:"Agropanel Calculator",agroSub:"Fixed dappa 0.60 mm | Olage 200",idioma:"Bhashe",largura:"Horagina coil agala (cm)",agroLargura:"Flap agala (cm)",espessura:"Sheet dappa (mm)",velocidade:"Machine speed (m/min)",falta:"Baki: ",tempo:"Samaya baki ",acaba:"Mugiyuva samaya: ",trocar:"User badalisi",voltar:"Options ge hindirugi",primeiro:"Modala access",bomDia:"Shubhodaya",boaTarde:"Shubha madhyahna",boaNoite:"Shubha ratri",ultimo:"Koneya access"},
    ml:{escolha:"Calculator theranjedukkuka",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil kanakku",agro:"Agropanel Calculator",agroSub:"Fixed kanam 0.60 mm | Akathu 200",idioma:"Bhasha",largura:"Purathu coil veethi (cm)",agroLargura:"Flap veethi (cm)",espessura:"Sheet kanam (mm)",velocidade:"Machine speed (m/min)",falta:"Bakki: ",tempo:"Samayam bakki ",acaba:"Avasana samayam: ",trocar:"User maattuka",voltar:"Options ilekku madangu",primeiro:"Adya access",bomDia:"Suprabhatham",boaTarde:"Shubha uchathirinju",boaNoite:"Shubha ratri",ultimo:"Avasana access"},
    pa:{escolha:"Calculator chuno",titulo:"Coil Calculator",bobina:"Coil Calculator",bobinaSub:"Standard coil ginti",agro:"Agropanel Calculator",agroSub:"Fixed motai 0.60 mm | Andar 200",idioma:"Bhasha",largura:"Bahari coil chaudai (cm)",agroLargura:"Flap chaudai (cm)",espessura:"Sheet motai (mm)",velocidade:"Machine speed (m/min)",falta:"Baki: ",tempo:"Samay baki ",acaba:"Mukammal hovega: ",trocar:"User badlo",voltar:"Options val wapas",primeiro:"Pehli access",bomDia:"Sat sri akal",boaTarde:"Shubh dupahir",boaNoite:"Shubh raat",ultimo:"Aakhri access"}
})

function showMain(){
    welcome.style.display="none"
    mainPanel.style.display="block"
    start()
}

if(nome){
    showMain()
}else{
    function entrarNoApp(){
        nome = nomeInput.value.trim()
        if(!nome){
            nomeInput.parentElement.classList.add("erro")
            nomeErro.innerText = "Digite um nome para continuar."
            nomeInput.focus()
            return
        }
        idioma = idiomaSelect.value
        localStorage.setItem("nomeUsuario", nome)
        localStorage.setItem("idiomaUsuario", idioma)
        salvarUsuarioFirebase()
        showMain()
    }
    entrar.onclick = entrarNoApp
    nomeInput.addEventListener("input", ()=>{
        nomeInput.parentElement.classList.remove("erro")
    })
    nomeInput.addEventListener("keydown", (event)=>{
        if(event.key === "Enter") entrarNoApp()
    })
}

// Botao trocar usuario
resetBtn.onclick = ()=>{
    localStorage.removeItem("nomeUsuario")
    localStorage.removeItem("idiomaUsuario")
    localStorage.removeItem("ultimo")
    location.reload()
}

function start(){
    let t = textos[idioma] || textos.pt
    let telaAtual = "escolha"

    function aplicarIdioma(){
        t = textos[idioma] || textos.pt
        idiomaSelect.value = idioma
        idiomaAtualSelect.value = idioma
        labelIdiomaAtual.innerText = t.idioma
        document.getElementById("labelLargura").innerText = t.largura
        document.getElementById("labelEspessura").innerText = t.espessura
        document.getElementById("labelVelocidade").innerText = t.velocidade
        document.getElementById("labelAgroLargura").innerText = t.agroLargura
        document.getElementById("labelAgroVelocidade").innerText = t.velocidade
        abrirBobinaBtn.querySelector("strong").innerText = t.bobina
        abrirBobinaBtn.querySelector("span").innerText = t.bobinaSub
        abrirAgropainelBtn.querySelector("strong").innerText = t.agro
        abrirAgropainelBtn.querySelector("span").innerText = t.agroSub
        document.querySelector(".agroIntro strong").innerText = t.agro
        document.querySelector(".agroIntro span").innerText = t.agroSub
        voltarBobinaBtn.innerText = t.voltar
        voltarAgropainelBtn.innerText = t.voltar
        resetBtn.innerText = t.trocar
        if(telaAtual === "escolha") document.getElementById("tituloPrograma").innerText = t.escolha
        if(telaAtual === "bobina") document.getElementById("tituloPrograma").innerText = t.titulo
        if(telaAtual === "agro") document.getElementById("tituloPrograma").innerText = t.agro
    }

    function trocarIdioma(novoIdioma){
        idioma = textos[novoIdioma] ? novoIdioma : "pt"
        localStorage.setItem("idiomaUsuario", idioma)
        salvarUsuarioFirebase()
        aplicarIdioma()
        atualizarSaudacao()
        calc()
        calcAgropainel()
    }

    function mostrarEscolha(){
        telaAtual = "escolha"
        document.getElementById("tituloPrograma").innerText = t.escolha
        calculatorChoice.style.display = "grid"
        bancoTesteSection.style.display = "block"
        bobinaCalculator.style.display = "none"
        agropainelCalculator.style.display = "none"
    }

    function abrirCalculadoraBobina(){
        telaAtual = "bobina"
        document.getElementById("tituloPrograma").innerText = t.titulo
        calculatorChoice.style.display = "none"
        bancoTesteSection.style.display = "none"
        bobinaCalculator.style.display = "block"
        agropainelCalculator.style.display = "none"
        calc()
    }

    function abrirCalculadoraAgropainel(){
        telaAtual = "agro"
        document.getElementById("tituloPrograma").innerText = t.agro
        calculatorChoice.style.display = "none"
        bancoTesteSection.style.display = "none"
        bobinaCalculator.style.display = "none"
        agropainelCalculator.style.display = "block"
        calcAgropainel()
    }

    abrirBobinaBtn.onclick = abrirCalculadoraBobina
    abrirAgropainelBtn.onclick = abrirCalculadoraAgropainel
    voltarBobinaBtn.onclick = mostrarEscolha
    voltarAgropainelBtn.onclick = mostrarEscolha
    idiomaAtualSelect.onchange = ()=>trocarIdioma(idiomaAtualSelect.value)

    // saudaÃ§Ã£o
    const saudacao = document.getElementById("saudacao")
    function atualizarSaudacao(){
        const agora = new Date()
        let h = agora.getHours()
        let s=t.boaNoite
        if(h<12)s=t.bomDia
        else if(h<18)s=t.boaTarde
        const ultimo = localStorage.getItem("ultimo") || t.primeiro
        saudacao.innerHTML = s+", "+nome+"<br>"+t.ultimo+": "+ultimo+"<br>"+agora.toLocaleTimeString()
    }
    aplicarIdioma()
    setInterval(atualizarSaudacao,1000)
    atualizarSaudacao()
    window.addEventListener("beforeunload", ()=>{
        localStorage.setItem("ultimo", new Date().toLocaleString())
        salvarUsuarioFirebase()
    })

    // largura
    const largura = document.getElementById("largura")
    for(let i=1;i<=50;i+=0.5){
        let o=document.createElement("option")
        o.value=i
        o.text=(i%1===0)? i+" cm":i.toFixed(1)+" cm"
        largura.appendChild(o)
    }
    largura.value = "10"
    largura.addEventListener("change", calc)

    // espessura
    const espDiv=document.getElementById("espessuras")
    const esp=[0.28,0.30,0.32,0.35,0.38,0.40,0.43,0.45,0.68]
    let espSel=0.32
    let espessuraSelecionadaPeloUsuario=false
    esp.forEach(e=>{
        let b=document.createElement("button")
        b.innerHTML=`<img src="https://img.icons8.com/dotty/80/line-width.png" style="width:18px;height:18px;margin-right:5px;"> ${e} mm`
        b.onclick=()=>{
            espDiv.querySelectorAll("button").forEach(x=>x.classList.remove("selecionado"))
            b.classList.add("selecionado")
            espSel=e
            espessuraSelecionadaPeloUsuario=true
            calc()
        }
        espDiv.appendChild(b)
        if(e === espSel) b.classList.add("selecionado")
    })

    // velocidade
    const velDiv=document.getElementById("velocidades")
    const vel=[5,6,7,8,9,10,11,12]
    let velSel=10
    let velocidadeSelecionadaPeloUsuario=false
    vel.forEach(v=>{
        let b=document.createElement("button")
        b.innerHTML=`<img src="https://img.icons8.com/color/48/speed.png" style="width:18px;height:18px;margin-right:5px;"> ${v} m/min`
        b.onclick=()=>{
            velDiv.querySelectorAll("button").forEach(x=>x.classList.remove("selecionado"))
            b.classList.add("selecionado")
            velSel=v
            velocidadeSelecionadaPeloUsuario=true
            calc()
        }
        velDiv.appendChild(b)
        if(v === velSel) b.classList.add("selecionado")
    })

    const agroLargura = document.getElementById("agroLargura")
    for(let i=1;i<=50;i+=0.5){
        let o=document.createElement("option")
        o.value=i
        o.text=(i%1===0)? i+" cm":i.toFixed(1)+" cm"
        agroLargura.appendChild(o)
    }
    agroLargura.value = "15"
    agroLargura.addEventListener("change", calcAgropainel)

    const agroVelDiv=document.getElementById("agroVelocidades")
    let agroVelSel=10
    vel.forEach(v=>{
        let b=document.createElement("button")
        b.innerHTML=`<img src="https://img.icons8.com/color/48/speed.png" style="width:18px;height:18px;margin-right:5px;"> ${v} m/min`
        b.onclick=()=>{
            agroVelDiv.querySelectorAll("button").forEach(x=>x.classList.remove("selecionado"))
            b.classList.add("selecionado")
            agroVelSel=v
            calcAgropainel()
        }
        agroVelDiv.appendChild(b)
        if(v === agroVelSel) b.classList.add("selecionado")
    })

    function calc(){
        const interno=500
        const pi=3.14
        const largura_cm=parseFloat(largura.value)
        const largura_mm=largura_cm*10
        const p1=largura_mm/espSel
        const p2=p1*pi
        const soma=interno+largura_mm
        const metros=Math.round((p2*soma)/1000)
        const tempoTotalMin=Math.round(metros/velSel)
        const fim=new Date()
        fim.setMinutes(fim.getMinutes()+tempoTotalMin)
        const horas=Math.floor(tempoTotalMin/60)
        const minutos=tempoTotalMin%60
        let textoTempo = (horas>0)? horas+" hr e "+minutos+" min" : minutos+" minutos"
        document.getElementById("metros").innerText = t.falta + metros + " metros"
        document.getElementById("tempo").innerText = t.tempo + textoTempo
        document.getElementById("hora").innerText = t.acaba + fim.toLocaleTimeString()
        if(telaAtual === "bobina" && espessuraSelecionadaPeloUsuario && velocidadeSelecionadaPeloUsuario){
            const dadosHistorico = {
                usuario: nome,
                larguraCm: largura_cm,
                espessuraMm: espSel,
                velocidade: velSel,
                metros,
                tempoTexto,
                fimHora: fim.toLocaleTimeString()
            }
            if(window.AtlasHistoricoBobina && typeof window.AtlasHistoricoBobina.salvar === "function"){
                window.AtlasHistoricoBobina.salvar(dadosHistorico)
            }
            window.dispatchEvent(new CustomEvent("atlas:bobina-calculada", { detail: dadosHistorico }))
        }
    }

    function calcAgropainel(){
        const interno=200
        const espessura=0.60
        const pi=3.14
        const largura_cm=parseFloat(agroLargura.value)
        const largura_mm=largura_cm*10
        const p1=largura_mm/espessura
        const p2=p1*pi
        const soma=interno+largura_mm
        const metros=Math.round((p2*soma)/1000)
        const tempoTotalMin=Math.round(metros/agroVelSel)
        const fim=new Date()
        fim.setMinutes(fim.getMinutes()+tempoTotalMin)
        const horas=Math.floor(tempoTotalMin/60)
        const minutos=tempoTotalMin%60
        let textoTempo = (horas>0)? horas+" hr e "+minutos+" min" : minutos+" minutos"
        document.getElementById("agroMetros").innerText = t.falta + metros + " metros"
        document.getElementById("agroTempo").innerText = t.tempo + textoTempo
        document.getElementById("agroHora").innerText = t.acaba + fim.toLocaleTimeString()
        if(telaAtual === "agro"){
            const dadosHistorico = {
                usuario: nome,
                larguraCm: largura_cm,
                espessuraMm: espessura,
                velocidade: agroVelSel,
                metros,
                tempoTexto,
                fimHora: fim.toLocaleTimeString()
            }
            if(window.AtlasHistoricoAgropainel && typeof window.AtlasHistoricoAgropainel.salvar === "function"){
                window.AtlasHistoricoAgropainel.salvar(dadosHistorico)
            }
            window.dispatchEvent(new CustomEvent("atlas:agropainel-calculado", { detail: dadosHistorico }))
        }
    }

    calc()
    salvarUsuarioFirebase()
    mostrarEscolha()
}
})

