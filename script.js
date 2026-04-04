document.addEventListener("DOMContentLoaded", () => {
    const btnParadaGeral = document.getElementById("btnParadaGeral");
    const confirmarBtn = document.getElementById("confirmarBtn");
    const containerBobinas = document.getElementById("containerBobinas");
    
    let maquinaLigada = localStorage.getItem("maquinaLigada") !== "false";
    let espSel = 0.32;
    let velSel = 10;

    let dadosBobinas = JSON.parse(localStorage.getItem("dadosBobinas")) || {
        "1": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "2": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "3": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 },
        "4": { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 }
    };

    // Inicialização
    configurarInputs();
    atualizarBotaoParada();
    setInterval(atualizarTimers, 1000);
    renderizar();

    function configurarInputs() {
        const larg = document.getElementById("largura");
        for (let i = 0.5; i <= 50; i += 0.5) {
            let o = document.createElement("option");
            o.value = i; o.text = i + " cm";
            if(i === 15) o.selected = true;
            larg.appendChild(o);
        }

        const espDiv = document.getElementById("espessuras");
        [0.28, 0.30, 0.32, 0.35, 0.38, 0.40,0.41,0.43, 0.45,0.68].forEach(e => {
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
        [5 , 6 , 8, 9 , 10, 11, 12].forEach(v => {
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
    }

    confirmarBtn.onclick = () => {
        const id = document.getElementById("selecaoBobina").value;
        const largura_mm = parseFloat(document.getElementById("largura").value) * 10;
        const metros = Math.round(((largura_mm / espSel) * 3.14 * (500 + largura_mm)) / 1000);
        
        dadosBobinas[id].metros = metros;
        dadosBobinas[id].segundos = Math.round(metros / velSel) * 60;
        dadosBobinas[id].mps = velSel / 60;
        dadosBobinas[id].ultimaAtualizacao = Date.now();
        
        // Regra: Se a outra bobina do par estiver vazia ou parada, esta entra ativa
        const par = (id === "1" || id === "2") ? ["1", "2"] : ["3", "4"];
        const outra = par.find(i => i !== id);
        
        if (!dadosBobinas[outra].ativo || dadosBobinas[outra].metros <= 0) {
            dadosBobinas[id].ativo = true;
            dadosBobinas[outra].ativo = false;
        } else {
            dadosBobinas[id].ativo = false; // Fica como reserva (estoque)
        }

        salvar();
        renderizar();
    };

    btnParadaGeral.onclick = () => {
        maquinaLigada = !maquinaLigada;
        localStorage.setItem("maquinaLigada", maquinaLigada);
        atualizarBotaoParada();
        renderizar();
    };

    function atualizarBotaoParada() {
        btnParadaGeral.innerText = maquinaLigada ? "🛑 PARAR MÁQUINA" : "▶️ LIGAR MÁQUINA";
        btnParadaGeral.style.background = maquinaLigada ? "#ce2029" : "#238636";
    }

    function atualizarTimers() {
        if (!maquinaLigada) return;
        let mudou = false;
        for (let id in dadosBobinas) {
            if (dadosBobinas[id].ativo && dadosBobinas[id].segundos > 0) {
                dadosBobinas[id].segundos--;
                dadosBobinas[id].metros -= dadosBobinas[id].mps;
                dadosBobinas[id].ultimaAtualizacao = Date.now();
                mudou = true;
                
                if (dadosBobinas[id].segundos <= 0) {
                    verificarFimDeBobina(id);
                }
            }
        }
        if (mudou) { salvar(); renderizar(); }
    }

    function verificarFimDeBobina(idFinalizada) {
        // 1. Zera a bobina que acabou
        dadosBobinas[idFinalizada] = { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 };
        
        // 2. Procura a vizinha do par para iniciar automaticamente
        const par = (idFinalizada === "1" || idFinalizada === "2") ? ["1", "2"] : ["3", "4"];
        const vizinhaId = par.find(i => i !== idFinalizada);

        if (dadosBobinas[vizinhaId].metros > 0) {
            dadosBobinas[vizinhaId].ativo = true;
            dadosBobinas[vizinhaId].ultimaAtualizacao = Date.now();
            console.log(`Bobina ${idFinalizada} acabou. Iniciando Bobina ${vizinhaId} automaticamente.`);
        }
    }

    window.alternarStatus = (id) => {
        const par = (id === "1" || id === "2") ? ["1", "2"] : ["3", "4"];
        const outra = par.find(i => i !== id);

        if (!dadosBobinas[id].ativo) {
            dadosBobinas[id].ativo = true;
            dadosBobinas[outra].ativo = false;
        } else {
            dadosBobinas[id].ativo = false;
        }
        salvar();
        renderizar();
    };

    function salvar() { localStorage.setItem("dadosBobinas", JSON.stringify(dadosBobinas)); }

    function renderizar() {
        containerBobinas.innerHTML = "";
        const linhas = [ {n: "LINHA 1", ids: ["1","2"]}, {n: "LINHA 2", ids: ["3","4"]} ];
        
        linhas.forEach(l => {
            const div = document.createElement("div");
            div.className = "linha-box";
            div.innerHTML = `<h3 style="text-align:center; color:#58a6ff; font-size:14px; margin-bottom:10px;">${l.n}</h3>`;
            
            l.ids.forEach(id => {
                const b = dadosBobinas[id];
                if (b.metros <= 0) return;
                
                const rodando = b.ativo && maquinaLigada;
                const card = document.createElement("div");
                card.className = `card ${rodando ? 'ativo' : 'pausado'}`;
                card.style = `padding:15px; border-radius:10px; margin-bottom:10px; border:2px solid ${rodando ? '#28a745' : '#444'}; background:${rodando ? '#0b2e13' : '#161b22'};`;
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:#fff;">BOBINA ${id}</span>
                        <button onclick="alternarStatus('${id}')" style="padding:5px 10px; border-radius:5px; border:none; cursor:pointer; background:${b.ativo ? '#dc3545' : '#28a745'}; color:white; font-size:10px; font-weight:bold;">
                            ${b.ativo ? 'PAUSAR' : 'INICIAR'}
                        </button>
                    </div>
                    <div style="font-size:24px; color:#fff; font-family:monospace; margin:10px 0;">${b.metros.toFixed(1)} m</div>
                    <div style="font-size:13px; color:#ffd54f;">${rodando ? 'RODANDO...' : 'AGUARDANDO'} | ${Math.floor(b.segundos/60)}m ${b.segundos%60}s</div>
                    <button style="background:none; border:none; color:#ff4444; cursor:pointer; text-decoration:underline; font-size:10px; margin-top:10px;" onclick="removerBobina('${id}')">Limpar/Zerar</button>
                `;
                div.appendChild(card);
            });
            containerBobinas.appendChild(div);
        });
    }

    window.removerBobina = (id) => { if(confirm("Deseja zerar esta bobina manualmente?")) { dadosBobinas[id] = { metros: 0, segundos: 0, mps: 0, ativo: false, ultimaAtualizacao: 0 }; salvar(); renderizar(); } };
});
