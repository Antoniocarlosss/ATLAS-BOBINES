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
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
        camera.position.set(0, 0.25, 8)

        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true})
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        container.appendChild(renderer.domElement)

        const light = new THREE.DirectionalLight(0xffffff, 1.55)
        light.position.set(2, 4, 5)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0xffffff, 0.9))

        const coilGroup = new THREE.Group()
        coilGroup.position.set(-0.95, 0.75, 0)
        scene.add(coilGroup)

        const whiteCoil = new THREE.MeshStandardMaterial({color:0xf3f4ef, metalness:0.08, roughness:0.42})
        const softShadow = new THREE.MeshStandardMaterial({color:0xcfd4d7, metalness:0.05, roughness:0.55})
        const darkMetal = new THREE.MeshStandardMaterial({color:0x1e242b, metalness:0.55, roughness:0.34})
        const steel = new THREE.MeshStandardMaterial({color:0x8f969b, metalness:0.45, roughness:0.32})
        const bluePaint = new THREE.MeshStandardMaterial({color:0x006fd6, metalness:0.2, roughness:0.38})
        const sheetMat = new THREE.MeshStandardMaterial({color:0xf4f6f2, metalness:0.12, roughness:0.35, side:THREE.DoubleSide})

        const coilBack = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.62, 96), softShadow)
        coilBack.rotation.x = Math.PI / 2
        coilBack.position.z = -0.18
        coilGroup.add(coilBack)

        const coilFace = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.2, 128), whiteCoil)
        coilFace.rotation.x = Math.PI / 2
        coilFace.position.z = 0.04
        coilGroup.add(coilFace)

        const outerLine = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.025, 10, 128), softShadow)
        coilGroup.add(outerLine)

        const innerRolls = []
        for(let r=0.76; r<=1.48; r+=0.18){
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.011, 8, 96), softShadow)
            ring.position.z = 0.16
            coilGroup.add(ring)
            innerRolls.push(ring)
        }

        const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 12, 64), steel)
        coreRing.position.z = 0.2
        coilGroup.add(coreRing)

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.24, 6), darkMetal)
        hub.rotation.x = Math.PI / 2
        hub.position.z = 0.28
        coilGroup.add(hub)

        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.32, 32), steel)
        center.rotation.x = Math.PI / 2
        center.position.z = 0.43
        coilGroup.add(center)

        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.15, 0.28), darkMetal)
        arm.position.set(-1.95, -0.5, -0.18)
        arm.rotation.z = -0.11
        scene.add(arm)

        const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.42, 1.2), bluePaint)
        base.position.set(-0.7, -2.15, -0.35)
        scene.add(base)

        const blueStand = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.55, 0.48), bluePaint)
        blueStand.position.set(-1.1, -0.8, -0.5)
        blueStand.rotation.z = -0.18
        scene.add(blueStand)

        const table = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 1.35), darkMetal)
        table.position.set(1.78, -1.95, -0.2)
        table.rotation.z = 0.08
        scene.add(table)

        const sheet = new THREE.Mesh(new THREE.PlaneGeometry(3.85, 1.05, 16, 1), sheetMat)
        sheet.position.set(1.15, -1.42, 0.28)
        sheet.rotation.set(-0.14, 0, 0.09)
        scene.add(sheet)

        const leadingSheet = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.05, 8, 1), sheetMat)
        leadingSheet.position.set(-0.22, -1.05, 0.34)
        leadingSheet.rotation.set(-0.34, 0, -0.34)
        scene.add(leadingSheet)

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
            const widthScale = Math.min(1.18, Math.max(0.82, params.larguraCm / 14))
            const radiusScale = Math.min(1.16, Math.max(0.78, params.metros / 1200))
            coilGroup.scale.set(radiusScale, radiusScale, 1)
            sheet.scale.y = widthScale
            leadingSheet.scale.y = widthScale
        }

        function animate(){
            frame += 0.016 * (params.velocidade / 8)
            coilGroup.rotation.z = -frame
            innerRolls.forEach((ring, index)=>{
                ring.rotation.z = frame * (0.35 + index * 0.03)
            })
            sheet.position.x = 1.15 + (frame % 0.45) * 0.18
            leadingSheet.rotation.z = -0.34 + Math.sin(frame * 2.4) * 0.025
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
