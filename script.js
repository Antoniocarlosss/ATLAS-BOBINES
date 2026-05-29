document.addEventListener("DOMContentLoaded", ()=>{

const welcome = document.getElementById("welcomeScreen")
const mainPanel = document.getElementById("mainPanel")
const nomeInput = document.getElementById("nomeUsuarioInput")
const idiomaSelect = document.getElementById("idiomaSelect")
const entrar = document.getElementById("entrarBtn")
const resetBtn = document.getElementById("resetUser")
const nomeErro = document.getElementById("nomeErro")
const calculatorChoice = document.getElementById("calculatorChoice")
const bobinaCalculator = document.getElementById("bobinaCalculator")
const agropainelCalculator = document.getElementById("agropainelCalculator")
const abrirBobinaBtn = document.getElementById("abrirBobinaBtn")
const abrirAgropainelBtn = document.getElementById("abrirAgropainelBtn")
const voltarBobinaBtn = document.getElementById("voltarBobinaBtn")
const voltarAgropainelBtn = document.getElementById("voltarAgropainelBtn")

let nome = localStorage.getItem("nomeUsuario")
let idioma = localStorage.getItem("idiomaUsuario") || "pt"

const textos = {
    pt:{titulo:"Calculadora de Bobina",largura:"Largura da bobina externa (cm)",espessura:"Espessura da chapa (mm)",velocidade:"Velocidade da máquina (m/min)",falta:"Falta para acabar: ",tempo:"Falta ",acaba:"Provavelmente acaba às: ",trocar:"Trocar usuário",primeiro:"Primeiro acesso",visual:"Visual 3D da bobina",ocultar:"Ocultar",mostrar:"Mostrar"},
    en:{titulo:"Coil Calculator",largura:"Width",espessura:"Thickness",velocidade:"Speed",falta:"Remaining: ",tempo:"Remaining ",acaba:"Finish at: ",trocar:"Change user",primeiro:"First access",visual:"3D coil view",ocultar:"Hide",mostrar:"Show"},
    hi:{titulo:"कॉइल कैलकुलेटर",largura:"चौड़ाई",espessura:"मोटाई",velocidade:"गति",falta:"बाकी: ",tempo:"बाकी ",acaba:"समाप्त: ",trocar:"यूज़र बदलें",primeiro:"पहली बार",visual:"3D कॉइल दृश्य",ocultar:"छिपाएं",mostrar:"दिखाएं"}
}

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

// botão trocar usuário
resetBtn.onclick = ()=>{
    localStorage.removeItem("nomeUsuario")
    localStorage.removeItem("idiomaUsuario")
    localStorage.removeItem("ultimo")
    location.reload()
}

function start(){
    const t = textos[idioma]
    document.getElementById("tituloPrograma").innerText = "Escolha a calculadora"
    document.getElementById("labelLargura").innerText = t.largura
    document.getElementById("labelEspessura").innerText = t.espessura
    document.getElementById("labelVelocidade").innerText = t.velocidade
    document.getElementById("labelVisual3d").innerText = t.visual
    resetBtn.innerText = t.trocar

    function mostrarEscolha(){
        document.getElementById("tituloPrograma").innerText = "Escolha a calculadora"
        calculatorChoice.style.display = "grid"
        bobinaCalculator.style.display = "none"
        agropainelCalculator.style.display = "none"
    }

    function abrirCalculadoraBobina(){
        document.getElementById("tituloPrograma").innerText = t.titulo
        calculatorChoice.style.display = "none"
        bobinaCalculator.style.display = "block"
        agropainelCalculator.style.display = "none"
        calc()
    }

    function abrirCalculadoraAgropainel(){
        document.getElementById("tituloPrograma").innerText = "Calculadora Agropainel"
        calculatorChoice.style.display = "none"
        bobinaCalculator.style.display = "none"
        agropainelCalculator.style.display = "block"
        calcAgropainel()
    }

    abrirBobinaBtn.onclick = abrirCalculadoraBobina
    abrirAgropainelBtn.onclick = abrirCalculadoraAgropainel
    voltarBobinaBtn.onclick = mostrarEscolha
    voltarAgropainelBtn.onclick = mostrarEscolha

    // saudação
    const saudacao = document.getElementById("saudacao")
    function atualizarSaudacao(){
        const agora = new Date()
        let h = agora.getHours()
        let s="Boa noite"
        if(h<12)s="Bom dia"
        else if(h<18)s="Boa tarde"
        const ultimo = localStorage.getItem("ultimo") || t.primeiro
        saudacao.innerHTML = s+", "+nome+"<br>Último acesso: "+ultimo+"<br>"+agora.toLocaleTimeString()
    }
    setInterval(atualizarSaudacao,1000)
    atualizarSaudacao()
    window.addEventListener("beforeunload", ()=>{
        localStorage.setItem("ultimo", new Date().toLocaleString())
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
    esp.forEach(e=>{
        let b=document.createElement("button")
        b.innerHTML=`<img src="https://img.icons8.com/dotty/80/line-width.png" style="width:18px;height:18px;margin-right:5px;"> ${e} mm`
        b.onclick=()=>{
            espDiv.querySelectorAll("button").forEach(x=>x.classList.remove("selecionado"))
            b.classList.add("selecionado")
            espSel=e
            calc()
        }
        espDiv.appendChild(b)
        if(e === espSel) b.classList.add("selecionado")
    })

    // velocidade
    const velDiv=document.getElementById("velocidades")
    const vel=[5,6,7,8,9,10,11,12]
    let velSel=10
    vel.forEach(v=>{
        let b=document.createElement("button")
        b.innerHTML=`<img src="https://img.icons8.com/color/48/speed.png" style="width:18px;height:18px;margin-right:5px;"> ${v} m/min`
        b.onclick=()=>{
            velDiv.querySelectorAll("button").forEach(x=>x.classList.remove("selecionado"))
            b.classList.add("selecionado")
            velSel=v
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
    }

    calc()
    mostrarEscolha()
}
})
