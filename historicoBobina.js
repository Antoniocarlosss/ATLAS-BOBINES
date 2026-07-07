(function(){
    const CHAVE_HISTORICO_BOBINA = "atlas_historico_bobina";
    const SENHA_APAGAR = "1234";
    let ultimaAssinatura = "";
    let itensAtuais = [];
    let usandoFirebase = false;

    function elementoLista(){
        return document.getElementById("historicoBobinaLista");
    }

    function elementoStatus(){
        return document.getElementById("historicoBobinaStatus");
    }

    function setStatus(texto){
        const status = elementoStatus();
        if(status) status.innerText = texto;
    }

    function htmlSeguro(valor){
        return String(valor ?? "").replace(/[&<>"']/g, (char)=>({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[char]));
    }

    function formatarNumero(valor){
        return Number(valor || 0).toLocaleString("pt-PT", {
            minimumFractionDigits: Number(valor) % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        });
    }

    function dataItem(item){
        if(item.criadoEm && typeof item.criadoEm.toDate === "function"){
            return item.criadoEm.toDate();
        }

        if(item.criadoEmLocal){
            return new Date(item.criadoEmLocal);
        }

        if(item.data && item.hora){
            return new Date(`${item.data} ${item.hora}`);
        }

        return new Date();
    }

    function formatarMomento(item){
        const data = dataItem(item);
        if(Number.isNaN(data.getTime())){
            return `${item.data || ""} ${item.hora || ""}`.trim();
        }
        return `${data.toLocaleDateString("pt-PT")} ${data.toLocaleTimeString("pt-PT", {hour:"2-digit", minute:"2-digit"})}`;
    }

    function numeroDoTexto(valor){
        const encontrado = String(valor || "").replace(",", ".").match(/\d+(\.\d+)?/);
        return encontrado ? Number(encontrado[0]) : 0;
    }

    function textoElemento(id){
        const elemento = document.getElementById(id);
        return elemento ? elemento.innerText.trim() : "";
    }

    function assinatura(item){
        return JSON.stringify({
            usuario: item.usuario || "Usuario",
            espessuraMm: Number(item.espessuraMm || 0),
            velocidade: Number(item.velocidade || 0),
            metros: Number(item.metros || item.quantidade || 0)
        });
    }

    function calculoValido(dados){
        return Boolean(
            dados &&
            Number(dados.espessuraMm) > 0 &&
            Number(dados.velocidade) > 0 &&
            Number(dados.metros) > 0 &&
            dados.tempoTexto &&
            dados.fimHora
        );
    }

    function normalizarItem(item){
        return {
            ...item,
            usuario: item.usuario || "Usuario",
            espessuraMm: Number(item.espessuraMm || 0),
            velocidade: Number(item.velocidade || 0),
            metros: Number(item.metros || item.quantidade || 0),
            criadoEmLocal: item.criadoEmLocal || new Date().toISOString()
        };
    }

    function coletarCalculoDaTela(){
        const espessuraSelecionada = document.querySelector("#espessuras button.selecionado");
        const velocidadeSelecionada = document.querySelector("#velocidades button.selecionado");
        const metrosTexto = textoElemento("metros");
        const tempoTextoCompleto = textoElemento("tempo");
        const horaTextoCompleto = textoElemento("hora");

        return {
            usuario: localStorage.getItem("nomeUsuario") || "Usuario",
            espessuraMm: numeroDoTexto(espessuraSelecionada ? espessuraSelecionada.innerText : ""),
            velocidade: numeroDoTexto(velocidadeSelecionada ? velocidadeSelecionada.innerText : ""),
            metros: numeroDoTexto(metrosTexto),
            tempoTexto: tempoTextoCompleto.replace(/^.*?(\d)/, "$1"),
            fimHora: horaTextoCompleto.split(": ").pop()
        };
    }

    function carregarHistorico(){
        try{
            const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO_BOBINA) || "[]");
            return Array.isArray(historico) ? historico.map(normalizarItem) : [];
        }catch(error){
            console.error("Erro ao carregar Historico Bobina:", error);
            return [];
        }
    }

    function gravarHistoricoLocal(itens){
        localStorage.setItem(CHAVE_HISTORICO_BOBINA, JSON.stringify(itens.slice(0, 10)));
    }

    function renderizarHistorico(itens = itensAtuais){
        const lista = elementoLista();
        if(!lista) return;

        itensAtuais = itens.map(normalizarItem).slice(0, 10);

        if(!itensAtuais.length){
            lista.innerHTML = "<p>Nenhuma bobina salva ainda.</p>";
            return;
        }

        lista.innerHTML = itensAtuais.map((item, index)=>`
            <article class="historicoItem historicoItemBobina historicoItemCompacto">
                <strong>${htmlSeguro(item.usuario || "Usuario")}</strong>
                <small>${htmlSeguro(formatarMomento(item))}</small>
                <span>${htmlSeguro(formatarNumero(item.espessuraMm))} mm</span>
                <span>${htmlSeguro(formatarNumero(item.velocidade))} m/min</span>
                <span>${htmlSeguro(formatarNumero(item.metros))} metros</span>
                <button type="button" class="apagarHistoricoBtn" data-historico-index="${index}">Apagar</button>
            </article>
        `).join("");
    }

    async function salvarHistorico(dados){
        if(!calculoValido(dados)) return false;

        const item = normalizarItem({
            usuario: dados.usuario || localStorage.getItem("nomeUsuario") || "Usuario",
            criadoEmLocal: new Date().toISOString(),
            espessuraMm: Number(dados.espessuraMm),
            velocidade: Number(dados.velocidade),
            metros: Number(dados.metros),
            tempoTexto: dados.tempoTexto,
            fimHora: dados.fimHora
        });

        const assinaturaAtual = assinatura(item);
        const assinaturaUltimoSalvo = itensAtuais[0] ? assinatura(itensAtuais[0]) : "";

        if(assinaturaAtual === ultimaAssinatura || assinaturaAtual === assinaturaUltimoSalvo){
            return false;
        }

        try{
            if(window.AtlasFirebase && window.AtlasFirebase.db){
                usandoFirebase = true;
                await window.AtlasFirebase.registrarHistoricoBobina("calculo manual", {
                    ...dados,
                    usuario: item.usuario,
                    produtoBobina: "Bobina",
                    quantidade: item.metros,
                    observacao: "Salvo manualmente na aba Bobina."
                });
                setStatus("Salvo no historico compartilhado");
            }else{
                const historicoLocal = [item, ...carregarHistorico()].slice(0, 10);
                gravarHistoricoLocal(historicoLocal);
                renderizarHistorico(historicoLocal);
                setStatus("Salvo neste aparelho");
            }
            ultimaAssinatura = assinaturaAtual;
            return true;
        }catch(error){
            console.error("Erro ao salvar Historico Bobina:", error);
            const historicoLocal = [item, ...carregarHistorico()].slice(0, 10);
            gravarHistoricoLocal(historicoLocal);
            renderizarHistorico(historicoLocal);
            setStatus("Firebase falhou. Salvo neste aparelho.");
            return true;
        }
    }

    async function salvarCalculoAtual(){
        const dados = calculoValido(window.AtlasCalculoBobinaAtual)
            ? window.AtlasCalculoBobinaAtual
            : coletarCalculoDaTela();

        if(!calculoValido(dados)){
            setStatus("Faca um calculo antes de salvar");
            return;
        }

        const salvou = await salvarHistorico(dados);
        if(!salvou){
            setStatus("Este calculo ja foi salvo");
        }
    }

    async function apagarHistorico(index){
        const item = itensAtuais[Number(index)];
        if(!item) return;

        const senha = window.prompt("Digite a senha para apagar este historico:");
        if(senha === null) return;

        if(senha !== SENHA_APAGAR){
            setStatus("Senha incorreta");
            return;
        }

        try{
            if(usandoFirebase && item.id && window.AtlasFirebase && window.AtlasFirebase.excluirHistoricoBobina){
                await window.AtlasFirebase.excluirHistoricoBobina(item.id);
                setStatus("Historico apagado");
                return;
            }

            const novosItens = itensAtuais.filter((_, itemIndex)=>itemIndex !== Number(index));
            gravarHistoricoLocal(novosItens);
            renderizarHistorico(novosItens);
            setStatus("Historico apagado");
        }catch(error){
            console.error("Erro ao apagar Historico Bobina:", error);
            setStatus("Erro ao apagar historico");
        }
    }

    function prepararBotaoSalvar(){
        const botao = document.getElementById("salvarBobinaHistoricoBtn");
        if(botao){
            botao.addEventListener("click", salvarCalculoAtual);
        }
    }

    function prepararBotaoApagar(){
        const lista = elementoLista();
        if(!lista) return;

        lista.addEventListener("click", (event)=>{
            const botao = event.target.closest(".apagarHistoricoBtn");
            if(!botao) return;
            apagarHistorico(botao.dataset.historicoIndex);
        });
    }

    function observarHistoricoCompartilhado(){
        if(!window.AtlasFirebase || !window.AtlasFirebase.db || !window.AtlasFirebase.observarHistoricos){
            usandoFirebase = false;
            renderizarHistorico(carregarHistorico());
            setStatus("Historico local");
            return;
        }

        usandoFirebase = true;
        setStatus("Historico compartilhado");
        window.AtlasFirebase.observarHistoricos((itens)=>{
            const normalizados = itens.map(normalizarItem);
            itensAtuais = normalizados;
            gravarHistoricoLocal(normalizados);
            renderizarHistorico(normalizados);
        }, (error)=>{
            console.error("Erro ao carregar Historico Bobina compartilhado:", error);
            usandoFirebase = false;
            renderizarHistorico(carregarHistorico());
            setStatus("Erro no Firebase. Mostrando local.");
        });
    }

    window.AtlasHistoricoBobina = {
        salvar: salvarHistorico,
        salvarHistorico,
        carregarHistorico,
        renderizarHistorico,
        chave: CHAVE_HISTORICO_BOBINA
    };

    document.addEventListener("DOMContentLoaded", ()=>{
        prepararBotaoSalvar();
        prepararBotaoApagar();
        observarHistoricoCompartilhado();
    });
})();
