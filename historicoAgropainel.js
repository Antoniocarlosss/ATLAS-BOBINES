(function(){
    const CHAVE_HISTORICO_AGROPAINEL = "atlas_historico_agropainel";
    let ultimaAssinatura = "";

    function elementoLista(){
        return document.getElementById("historicoAgropainelLista");
    }

    function elementoStatus(){
        return document.getElementById("historicoAgropainelStatus");
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

    function formatarMomento(dataIso){
        const data = new Date(dataIso);
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
            usuario: item.usuario,
            espessuraMm: Number(item.espessuraMm || 0),
            velocidade: Number(item.velocidade || 0),
            metros: Number(item.metros || 0)
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

    function coletarCalculoDaTela(){
        const velocidadeSelecionada = document.querySelector("#agroVelocidades button.selecionado");
        const metrosTexto = textoElemento("agroMetros");
        const tempoTextoCompleto = textoElemento("agroTempo");
        const horaTextoCompleto = textoElemento("agroHora");

        return {
            usuario: localStorage.getItem("nomeUsuario") || "Usuario",
            espessuraMm: 0.60,
            velocidade: numeroDoTexto(velocidadeSelecionada ? velocidadeSelecionada.innerText : ""),
            metros: numeroDoTexto(metrosTexto),
            tempoTexto: tempoTextoCompleto.replace(/^.*?(\d)/, "$1"),
            fimHora: horaTextoCompleto.split(": ").pop()
        };
    }

    function carregarHistorico(){
        try{
            const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO_AGROPAINEL) || "[]");
            return Array.isArray(historico) ? historico : [];
        }catch(error){
            console.error("Erro ao carregar Historico Agropainel:", error);
            return [];
        }
    }

    function gravarHistorico(itens){
        localStorage.setItem(CHAVE_HISTORICO_AGROPAINEL, JSON.stringify(itens.slice(0, 10)));
    }

    function renderizarHistorico(){
        const lista = elementoLista();
        if(!lista) return;

        const itens = carregarHistorico();
        if(!itens.length){
            lista.innerHTML = "<p>Nenhum agropainel salvo ainda.</p>";
            return;
        }

        lista.innerHTML = itens.map((item)=>`
            <article class="historicoItem historicoItemAgropainel historicoItemCompacto">
                <strong>${htmlSeguro(item.usuario || "Usuario")}</strong>
                <small>${htmlSeguro(formatarMomento(item.criadoEmLocal))}</small>
                <span>${htmlSeguro(formatarNumero(item.espessuraMm))} mm</span>
                <span>${htmlSeguro(formatarNumero(item.velocidade))} m/min</span>
                <span>${htmlSeguro(formatarNumero(item.metros))} metros</span>
            </article>
        `).join("");
    }

    async function salvarNoFirebase(dados, item, anterior){
        if(!window.AtlasFirebase) return;

        try{
            await window.AtlasFirebase.registrarHistoricoAgropainel("calculo manual", anterior, {
                ...dados,
                usuario: item.usuario,
                produtoBobina: "Agropainel",
                quantidade: item.metros,
                observacao: "Salvo manualmente na aba Agropainel."
            }, item.usuario);
        }catch(error){
            console.error("Erro ao salvar Historico Agropainel no Firebase:", error);
        }
    }

    function salvarHistorico(dados){
        if(!calculoValido(dados)) return false;

        const item = {
            usuario: dados.usuario || localStorage.getItem("nomeUsuario") || "Usuario",
            criadoEmLocal: new Date().toISOString(),
            espessuraMm: Number(dados.espessuraMm),
            velocidade: Number(dados.velocidade),
            metros: Number(dados.metros)
        };

        const historicoAtual = carregarHistorico();
        const assinaturaAtual = assinatura(item);
        const assinaturaUltimoSalvo = historicoAtual[0] ? assinatura(historicoAtual[0]) : "";

        if(assinaturaAtual === ultimaAssinatura || assinaturaAtual === assinaturaUltimoSalvo){
            return false;
        }

        try{
            gravarHistorico([item, ...historicoAtual]);
            ultimaAssinatura = assinaturaAtual;
            renderizarHistorico();
            const status = elementoStatus();
            if(status) status.innerText = "Salvo no histórico";
            salvarNoFirebase(dados, item, historicoAtual[0] || null);
            return true;
        }catch(error){
            console.error("Erro ao salvar Historico Agropainel:", error);
            return false;
        }
    }

    function salvarCalculoAtual(){
        const status = elementoStatus();
        const dados = calculoValido(window.AtlasCalculoAgropainelAtual)
            ? window.AtlasCalculoAgropainelAtual
            : coletarCalculoDaTela();

        if(!calculoValido(dados)){
            if(status) status.innerText = "Faça um cálculo antes de salvar";
            return;
        }

        const salvou = salvarHistorico(dados);
        if(!salvou && status){
            status.innerText = "Este cálculo já foi salvo";
        }
    }

    function prepararBotao(){
        const botao = document.getElementById("salvarAgropainelHistoricoBtn");
        if(botao){
            botao.addEventListener("click", salvarCalculoAtual);
        }
    }

    window.AtlasHistoricoAgropainel = {
        salvar: salvarHistorico,
        salvarHistorico,
        carregarHistorico,
        renderizarHistorico,
        chave: CHAVE_HISTORICO_AGROPAINEL
    };

    document.addEventListener("DOMContentLoaded", ()=>{
        prepararBotao();
        renderizarHistorico();
    });
})();
