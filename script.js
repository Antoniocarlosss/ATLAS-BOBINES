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
    document.getElementById("labelVisual3d").innerText = t.visual
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

    const visual3d = criarVisual3d()
    const visualPanel = document.getElementById("visual3dPanel")
    const toggleVisual = document.getElementById("toggleVisual3d")
    toggleVisual.innerText = t.ocultar
    toggleVisual.onclick = ()=>{
        visualPanel.classList.toggle("recolhido")
        toggleVisual.innerText = visualPanel.classList.contains("recolhido") ? t.mostrar : t.ocultar
        visual3d.resize()
    }

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
        document.getElementById("visualMetros").innerText = metros + " m"
        document.getElementById("visualVelocidade").innerText = velSel + " m/min"
        document.getElementById("visualEspessura").innerText = espSel + " mm"
        visual3d.update({larguraCm:largura_cm, espessura:espSel, velocidade:velSel, metros})
    }

    function criarVisual3d(){
        const container = document.getElementById("coilViewer")
        if(!window.THREE){
            container.innerHTML = "<div style='padding:18px;color:#dceeff;text-align:center'>Visual 3D indisponível sem internet.</div>"
            return {update(){}, resize(){}}
        }

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
        camera.position.set(0, 2.2, 6)

        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true})
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        container.appendChild(renderer.domElement)

        const light = new THREE.DirectionalLight(0xffffff, 1.8)
        light.position.set(3, 4, 5)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0x9ecfff, 0.75))

        const coilGroup = new THREE.Group()
        scene.add(coilGroup)

        const metal = new THREE.MeshStandardMaterial({color:0x9fb6c9, metalness:0.55, roughness:0.28})
        const edge = new THREE.MeshStandardMaterial({color:0x1c2f45, metalness:0.35, roughness:0.4})
        const sheetMat = new THREE.MeshStandardMaterial({color:0x00e0ff, metalness:0.25, roughness:0.22})

        const coil = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 1.35, 72, 1, true), metal)
        coil.rotation.z = Math.PI / 2
        coilGroup.add(coil)

        const leftCap = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.045, 10, 72), edge)
        leftCap.position.x = -0.68
        leftCap.rotation.y = Math.PI / 2
        coilGroup.add(leftCap)

        const rightCap = leftCap.clone()
        rightCap.position.x = 0.68
        coilGroup.add(rightCap)

        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.42, 48), edge)
        core.rotation.z = Math.PI / 2
        coilGroup.add(core)

        const sheet = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.035, 1), sheetMat)
        sheet.position.set(1.85, -0.35, 0)
        sheet.rotation.z = -0.12
        scene.add(sheet)

        const rollGuide = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 36), edge)
        rollGuide.position.set(2.85, -0.42, 0)
        rollGuide.rotation.x = Math.PI / 2
        scene.add(rollGuide)

        let params = {larguraCm:10, espessura:0.32, velocidade:10, metros:0}
        let frame = 0

        function resize(){
            if(container.offsetParent === null) return
            const width = container.clientWidth || 320
            const height = container.clientHeight || 220
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height, false)
        }

        function update(next){
            params = next
            const widthScale = Math.min(1.55, Math.max(0.55, params.larguraCm / 16))
            const radiusScale = Math.min(1.28, Math.max(0.72, params.metros / 1300))
            coilGroup.scale.set(widthScale, radiusScale, radiusScale)
            sheet.scale.z = widthScale
        }

        function animate(){
            frame += 0.016 * (params.velocidade / 8)
            coilGroup.rotation.x = -0.35
            coilGroup.rotation.y = frame
            sheet.position.x = 1.75 + Math.sin(frame * 3) * 0.08
            sheet.material.emissive = new THREE.Color(0x003344)
            renderer.render(scene, camera)
            requestAnimationFrame(animate)
        }

        window.addEventListener("resize", resize)
        resize()
        animate()

        return {update, resize}
    }
    calc()
}
})
