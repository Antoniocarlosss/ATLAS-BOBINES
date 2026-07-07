document.addEventListener("DOMContentLoaded", ()=>{
    const lista = document.getElementById("historicoLista");
    const listaBobina = document.getElementById("historicoBobinaLista");
    const listaAgropainel = document.getElementById("historicoAgropainelLista");
    const status = document.getElementById("historicoStatus");
    const testarBancoBtn = document.getElementById("testarBancoBtn");
    const firebaseTesteMensagem = document.getElementById("firebaseTesteMensagem");

    let historicosBobina = [];
    let historicosAgropainel = [];

    function htmlSeguro(valor){
        return String(valor ?? "").replace(/[&<>"']/g, (char)=>({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[char]));
    }

    function timestampOrdenacao(item){
        if(item.criadoEm && typeof item.criadoEm.toDate === "function"){
            return item.criadoEm.toDate().getTime();
        }
        return Date.parse(item.criadoEmLocal || `${item.data || ""} ${item.hora || ""}`) || 0;
    }

    function valorPrincipal(item, campo){
        const valores = item.valores || item.valoresDepois || {};
        return item[campo] ?? valores[campo] ?? "-";
    }

    function cardHistorico(item, tipo){
        const usuario = item.usuario || "Usuario";
        const largura = valorPrincipal(item, "larguraCm");
        const espessura = valorPrincipal(item, "espessuraMm");
        const velocidade = valorPrincipal(item, "velocidade");
        const metros = valorPrincipal(item, "metros") || valorPrincipal(item, "quantidade");
        const tempo = valorPrincipal(item, "tempoTexto");
        const fim = valorPrincipal(item, "fimHora");
        const acao = item.tipoAcao || item.acaoRealizada || "calculo automatico";

        return `
            <article class="historicoItem historicoItem${tipo}">
                <div class="historicoTopo">
                    <strong>${htmlSeguro(tipo)}</strong>
                    <small>${htmlSeguro(item.data || "-")} ${htmlSeguro(item.hora || "")}</small>
                </div>
                <span class="historicoUsuario">${htmlSeguro(usuario)}</span>
                <div class="historicoResumo">
                    <b>${htmlSeguro(metros)} m</b>
                    <b>${htmlSeguro(espessura)} mm</b>
                    <b>${htmlSeguro(velocidade)} m/min</b>
                </div>
                <div class="historicoDetalhes">
                    <small>Largura: ${htmlSeguro(largura)} cm</small>
                    <small>Tempo: ${htmlSeguro(tempo)}</small>
                    <small>Acaba: ${htmlSeguro(fim)}</small>
                    <small>Acao: ${htmlSeguro(acao)}</small>
                </div>
            </article>
        `;
    }

    function renderizarLista(elemento, itens, tipo, vazio){
        const ordenados = itens
            .sort((a, b)=>timestampOrdenacao(b) - timestampOrdenacao(a))
            .slice(0, 10);

        if(!ordenados.length){
            elemento.innerHTML = `<p>${vazio}</p>`;
            return;
        }

        elemento.innerHTML = ordenados.map((item)=>cardHistorico(item, tipo)).join("");
    }

    function renderizarHistorico(){
        renderizarLista(listaBobina, historicosBobina, "Bobina", "Nenhuma bobina salva ainda.");
        renderizarLista(listaAgropainel, historicosAgropainel, "Agropainel", "Nenhum agropainel salvo ainda.");
    }

    function iniciarHistorico(){
        if(!window.AtlasFirebase){
            status.innerText = "Firebase nao carregado.";
            lista.innerHTML = "<p>Nao foi possivel iniciar o Firebase.</p>";
            return;
        }

        status.innerText = "Historico ligado.";
        window.AtlasFirebase.observarHistoricos((itens)=>{
            historicosBobina = itens;
            status.innerText = "Historico atualizado.";
            renderizarHistorico();
        }, (error)=>{
            status.innerText = "Erro ao carregar historico.";
            listaBobina.innerHTML = `<p>${htmlSeguro(error.message || error)}</p>`;
        });

        window.AtlasFirebase.observarHistoricoAgropainel((itens)=>{
            historicosAgropainel = itens;
            status.innerText = "Historico atualizado.";
            renderizarHistorico();
        }, (error)=>{
            status.innerText = "Erro ao carregar historico do Agropainel.";
            listaAgropainel.innerHTML = `<p>${htmlSeguro(error.message || error)}</p>`;
        });
    }

    async function testarBanco(){
        firebaseTesteMensagem.className = "firebaseTesteMensagem";
        firebaseTesteMensagem.innerText = "A testar conexao com Firebase...";

        try{
            if(!window.AtlasFirebase){
                throw new Error("Firebase nao carregado. Verifique a conexao com a internet e os scripts do Firebase.");
            }
            await window.AtlasFirebase.testarBanco();
            firebaseTesteMensagem.classList.add("sucesso");
            firebaseTesteMensagem.innerText = "Conexão com Firebase realizada com sucesso.";
        }catch(error){
            firebaseTesteMensagem.classList.add("erro");
            firebaseTesteMensagem.innerText = error.message || String(error);
        }
    }

    testarBancoBtn.addEventListener("click", testarBanco);

    iniciarHistorico();
});
