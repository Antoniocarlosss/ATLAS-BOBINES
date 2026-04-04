document.addEventListener("DOMContentLoaded", () => {
    const welcome = document.getElementById("welcomeScreen");
    const mainPanel = document.getElementById("mainPanel");
    const nomeInput = document.getElementById("nomeUsuarioInput");
    const entrar = document.getElementById("entrarBtn");
    const confirmarBtn = document.getElementById("confirmarBtn");
    const containerBobinas = document.getElementById("containerBobinas");
    const selecaoBobina = document.getElementById("selecaoBobina");

    let nome = localStorage.getItem("nomeUsuario");
    let espSel = 0.32;
    let velSel = 10;
    
    let dadosBobinas = JSON.parse(localStorage.getItem("dadosBobinas")) || {
        "1": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "2": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "3": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "4": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 }
    };

    if (nome) showMain();
    else {
        entrar.onclick = () => {
            if (!nomeInput.value) return;
            localStorage.setItem("nomeUsuario", nomeInput.value);
            showMain();
        };
    }

    function showMain() {
        welcome.style.display = "none";
        mainPanel.style.display = "block";
        recuperarTempoPerdido();
        start();
        setInterval(atualizarTimers, 1000);
    }

    function recuperarTempoPerdido() {
        const agora = Date.now();
        for (let id in dadosBobinas) {
            if (dadosBobinas[id].ativo && dadosBobinas[id].ultimaAtualizacao > 0) {
                const segundosPassados = Math.floor((agora - dadosBobinas[id].ultimaAtualizacao) / 1000);
                dadosBobinas[id].segundos -= segundosPassados;
                dadosBobinas[id].metros -= (dadosBobinas[id].mps * segundosPassados);
                if (dadosBobinas[id].segundos <= 0) zerarBobina(id);
            }
        }
        renderizarCards();
    }

    function start() {
        document.getElementById("saudacao").innerText = `Operador: ${localStorage.getItem("nomeUsuario")}`;
        
        const larguraSelect = document.getElementById("largura");
        for (let i = 1; i <= 50; i += 0.5) {
            let o = document.createElement("option");
            o.value = i; o.text = i + " cm";
            if(i === 15) o.selected = true;
            larguraSelect.appendChild(o);
        }

        const espDiv = document.getElementById("espessuras");
        const espessuras = [0.28, 0.30, 0.32, 0.35, 0.38, 0.40, 0.43, 0.45, 0.68];
        espDiv.innerHTML = "";
        espessuras.forEach(e => {
            let b = document.createElement("button");
            b.innerText = e;
            if(e === 0.32) b.classList.add("selecionado");
            b.onclick = () => {
                espDiv.querySelectorAll("button").forEach(x => x.classList.remove("selecionado"));
                b.classList.add("selecionado");
                espSel = e;
            };
            espDiv.appendChild(b);
        });

        const velDiv = document.getElementById("velocidades");
        const velocidades = [5, 6, 7, 8, 9, 10, 11, 12];
        velDiv.innerHTML = "";
        velocidades.forEach(v => {
            let b = document.createElement("button");
            b.innerText = v;
            if(v === 10) b.classList.add("selecionado");
            b.onclick = () => {
                velDiv.querySelectorAll("button").forEach(x => x.classList.remove("selecionado"));
                b.classList.add("selecionado");
                velSel = v;
            };
            velDiv.appendChild(b);
        });

        confirmarBtn.onclick = () => {
            const id = selecaoBobina.value;
            const largura_mm = parseFloat(larguraSelect.value) * 10;
            const metrosCalculados = Math.round(((largura_mm / espSel) * 3.14 * (500 + largura_mm)) / 1000);
            
            dadosBobinas[id].metros = metrosCalculados;
            dadosBobinas[id].segundos = Math.round(metrosCalculados / velSel) * 60;
            dadosBobinas[id].mps = velSel / 60;
            dadosBobinas[id].ultimaAtualizacao = Date.now();
            
            if(confirm(`A Bobina ${id} entra em produção agora?`)) {
                ativarUnicaNoGrupo(id);
            } else {
                dadosBobinas[id].ativo = false;
            }
            
            salvarDados();
            renderizarCards();
        };
    }

    // LÓGICA DE TROCA AUTOMÁTICA
    window.alternarStatus = (id) => {
        const par = (id === "1" || id === "2") ? ["1", "2"] : ["3", "4"];
        const outraId = par.find(item => item !== id);

        if (!dadosBobinas[id].ativo) {
            // Se estou iniciando esta, a outra pausa
            dadosBobinas[id].ativo = true;
            dadosBobinas[outraId].ativo = false;
        } else {
            // Se estou pausando esta, a outra inicia (se tiver metros)
            dadosBobinas[id].ativo = false;
            if (dadosBobinas[outraId].metros > 0) {
                dadosBobinas[outraId].ativo = true;
            }
        }
        
        dadosBobinas[id].ultimaAtualizacao = Date.now();
        dadosBobinas[outraId].ultimaAtualizacao = Date.now();
        
        salvarDados();
        renderizarCards();
    };

    function ativarUnicaNoGrupo(id) {
        const par = (id === "1" || id === "2") ? ["1", "2"] : ["3", "4"];
        par.forEach(item => {
            dadosBobinas[item].ativo = (item === id);
            dadosBobinas[item].ultimaAtualizacao = Date.now();
        });
    }

    function atualizarTimers() {
        let houveMudanca = false;
        for (let id in dadosBobinas) {
            if (dadosBobinas[id].ativo && dadosBobinas[id].segundos > 0) {
                dadosBobinas[id].segundos--;
                dadosBobinas[id].metros -= dadosBobinas[id].mps;
                dadosBobinas[id].ultimaAtualizacao = Date.now();
                houveMudanca = true;
                if(dadosBobinas[id].segundos <= 0) zerarBobina(id);
            }
        }
        if (houveMudanca) {
            salvarDados();
            renderizarCards();
        }
    }

    function zerarBobina(id) {
        dadosBobinas[id].metros = 0;
        dadosBobinas[id].segundos = 0;
        dadosBobinas[id].ativo = false;
        dadosBobinas[id].ultimaAtualizacao = 0;
        
        // Se uma bobina acabar sozinha, a vizinha dela deve iniciar automaticamente?
        // Descomente a lógica abaixo se quiser que ao acabar a 1, a 2 comece sozinha:
        /*
        const par = (id === "1" || id === "2") ? ["1", "2"] : ["3", "4"];
        const outraId = par.find(item => item !== id);
        if(dadosBobinas[outraId].metros > 0) {
            dadosBobinas[outraId].ativo = true;
            dadosBobinas[outraId].ultimaAtualizacao = Date.now();
        }
        */
    }

    function salvarDados() {
        localStorage.setItem("dadosBobinas", JSON.stringify(dadosBobinas));
    }

    function renderizarCards() {
        containerBobinas.innerHTML = "";
        const grupos = [
            { nome: "LINHA 1 (Bobinas 1-2)", ids: ["1", "2"] },
            { nome: "LINHA 2 (Bobinas 3-4)", ids: ["3", "4"] }
        ];

        grupos.forEach(grupo => {
            const grupoDiv = document.createElement("div");
            grupoDiv.style = "margin-bottom: 20px; border: 1px solid #333; padding: 10px; border-radius: 12px; background: #151515;";
            grupoDiv.innerHTML = `<h4 style="color:#00e0ff; margin-bottom:10px; font-size:11px; text-align:center;">${grupo.nome}</h4>`;
            
            grupo.ids.forEach(id => {
                const b = dadosBobinas[id];
                if (b.metros <= 0) return;

                const isAtiva = b.ativo;
                const min = Math.floor(b.segundos / 60);
                const seg = b.segundos % 60;

                const card = document.createElement("div");
                card.style = `padding: 15px; background: ${isAtiva ? '#0b2e13' : '#222'}; border: 1px solid ${isAtiva ? '#28a745' : '#444'}; border-radius: 8px; margin-bottom: 10px;`;
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-weight: bold; color: #fff">BOBINA ${id}</span>
                        <button onclick="alternarStatus('${id}')" style="background:${isAtiva ? '#dc3545' : '#28a745'}; color:white; border:none; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
                            ${isAtiva ? 'PAUSAR' : 'INICIAR'}
                        </button>
                    </div>
                    
                    <div style="font-size: 26px; color: #fff; font-family: monospace; margin-bottom:5px;">${b.metros.toFixed(1)} m</div>
                    <div style="font-size: 15px; color: #ffd54f;">${isAtiva ? 'FALTA: ' : 'TOTAL: '}${min}m ${seg < 10 ? '0'+seg : seg}s</div>
                    
                    <div style="margin-top: 10px; text-align: right;">
                        <button onclick="removerBobina('${id}')" style="background:none; color:#ff4444; border:none; cursor:pointer; font-size:11px; text-decoration:underline;">Limpar</button>
                    </div>
                `;
                grupoDiv.appendChild(card);
            });
            containerBobinas.appendChild(grupoDiv);
        });
    }

    window.removerBobina = (id) => {
        if(confirm(`Limpar dados da Bobina ${id}?`)) {
            zerarBobina(id);
            salvarDados();
            renderizarCards();
        }
    };
});
// Localize onde o card é criado no seu renderizarCards e deixe assim:
const card = document.createElement("div");
card.className = "card-bobina"; // Adicione esta linha
card.style = `padding: 15px; background: ${isAtiva ? '#0b2e13' : '#222'}; border: 1px solid ${isAtiva ? '#28a745' : '#444'}; border-radius: 8px; margin-bottom: 10px;`;
