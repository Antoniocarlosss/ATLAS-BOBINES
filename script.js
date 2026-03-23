document.addEventListener("DOMContentLoaded", ()=>{

const welcome = document.getElementById("welcomeScreen")
const mainPanel = document.getElementById("mainPanel")
const nomeInput = document.getElementById("nomeUsuarioInput")
const idiomaSelect = document.getElementById("idiomaSelect")
const entrar = document.getElementById("entrarBtn")
const resetBtn = document.getElementById("resetUser")

let nome = localStorage.getItem("nomeUsuario")
let idioma = localStorage.getItem("idiomaUsuario") || "pt"

const textos = {
    pt:{titulo:"Calculadora de Bobina",largura:"Largura da bobina externa (cm)",espessura:"Espessura da chapa (mm)",velocidade:"Velocidade da máquina (m/min)",falta:"Falta para acabar: ",tempo:"Falta ",acaba:"Provavelmente acaba às: ",trocar:"Trocar usuário",primeiro:"Primeiro acesso"},
    en:{titulo:"Coil Calculator",largura:"Width",espessura:"Thickness",velocidade:"Speed",falta:"Remaining: ",tempo:"Remaining ",acaba:"Finish at: ",trocar:"Change user",primeiro:"First access"},
    hi:{titulo:"कॉइल कैलकुलेटर",largura:"चौड़ाई",espessura:"मोटाई",velocidade:"गति",falta:"बाकी: ",tempo:"बाकी ",acaba:"समाप्त: ",trocar:"यूज़र बदलें",primeiro:"पहली बार"}
}

function showMain(){
    welcome.style.display="none"
    mainPanel.style.display="block"
    start()
}

if(nome){
    showMain()
}else{
    entrar.onclick = ()=>{
        nome = nomeInput.value
        idioma = idiomaSelect.value
        localStorage.setItem("nomeUsuario", nome)
        localStorage.setItem("idiomaUsuario", idioma)
        showMain()
    }
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
    document.getElementById("tituloPrograma").innerText = t.titulo
    document.getElementById("labelLargura").innerText = t.largura
    document.getElementById("labelEspessura").innerText = t.espessura
    document.getElementById("labelVelocidade").innerText = t.velocidade
    resetBtn.innerText = t.trocar

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

    // espessura
    const espDiv=document.getElementById("espessuras")
    const esp=[0.28,0.30,0.32,0.35,0.38,0.40,0.45,0.68]
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
    calc()
}
})
