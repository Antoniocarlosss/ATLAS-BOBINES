document.addEventListener("DOMContentLoaded", ()=>{
    const lista = document.getElementById("historicoLista");
    const status = document.getElementById("historicoStatus");
    const salvarBobina = document.getElementById("salvarHistoricoBobina");
    const salvarAgro = document.getElementById("salvarHistoricoAgro");
    const testarBancoBtn = document.getElementById("testarBancoBtn");
    const firebaseTesteMensagem = document.getElementById("firebaseTesteMensagem");

    let historicosBobina = [];
    let historicosAgropainel = [];

    function texto(elemento){
        return elemento ? elemento.innerText.trim() : "";
    }

    function numeroDoTexto(valor, padrao = 0){
        const encontrado = String(valor || "").replace(",", ".").match(/\d+(\.\d+)?/);
        return encontrado ? Number(encontrado[0]) : padrao;
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

    function nomeUsuario(){
        return localStorage.getItem("nomeUsuario") || "Usuario";
    }

    function botaoSelecionado(seletor, padrao){
        const botao = document.querySelector(`${seletor} button.selecionado`);
        return numeroDoTexto(texto(botao), padrao);
    }

    function resultadoBobina(){
        const largura = document.getElementById("largura");
        return {
            tipo: "bobina",
            produtoBobina: "Bobina",
            larguraCm: Number(largura ? largura.value : 0),
            espessuraMm: botaoSelecionado("#espessuras", 0.32),
            velocidade: botaoSelecionado("#velocidades", 10),
            metros: numeroDoTexto(texto(document.getElementById("metros"))),
            quantidade: numeroDoTexto(texto(document.getElementById("metros"))),
            tempoTexto: texto(document.getElementById("tempo")).replace(/^.*?(\d)/, "$1"),
            fimHora: texto(document.getElementById("hora")).split(": ").pop(),
            observacao: "Calculo de bobina salvo manualmente."
        };
    }

    function resultadoAgropainel(){
        const largura = document.getElementById("agroLargura");
        return {
            tipo: "agropainel",
            produtoBobina: "Agropainel",
            larguraCm: Number(largura ? largura.value : 0),
            espessuraMm: 0.60,
            velocidade: botaoSelecionado("#agroVelocidades", 10),
            metros: numeroDoTexto(texto(document.getElementById("agroMetros"))),
            quantidade: numeroDoTexto(texto(document.getElementById("agroMetros"))),
            tempoTexto: texto(document.getElementById("agroTempo")).replace(/^.*?(\d)/, "$1"),
            fimHora: texto(document.getElementById("agroHora")).split(": ").pop(),
            observacao: "Calculo de agropainel salvo manualmente."
        };
    }

    function detalhes(item){
        const valores = item.valores || item.valoresDepois || item;
        return [
            valores.larguraCm ? `Largura ${valores.larguraCm} cm` : "",
            valores.espessuraMm ? `Espessura ${valores.espessuraMm} mm` : "",
            valores.velocidade ? `Velocidade ${valores.velocidade} m/min` : "",
            item.observacao ? `Obs: ${item.observacao}` : ""
        ].filter(Boolean).join(" | ");
    }

    function timestampOrdenacao(item){
        if(item.criadoEm && typeof item.criadoEm.toDate === "function"){
            return item.criadoEm.toDate().getTime();
        }
        return Date.parse(item.criadoEmLocal || `${item.data || ""} ${item.hora || ""}`) || 0;
    }

    function renderizarHistorico(){
        const itens = [...historicosBobina, ...historicosAgropainel]
            .sort((a, b)=>timestampOrdenacao(b) - timestampOrdenacao(a))
            .slice(0, 50);

        if(!itens.length){
            lista.innerHTML = "<p>Ainda nao existe historico salvo.</p>";
            return;
        }

        lista.innerHTML = itens.map((item)=>{
            const isAgro = item.origem === "agropainel" || item.acaoRealizada;
            const tipo = isAgro ? "Agropainel" : (item.produtoBobina || "Bobina");
            const acao = item.acaoRealizada || item.tipoAcao || "producao";
            const quantidade = item.quantidade ?? item.valores?.quantidade ?? item.valores?.metros ?? item.valoresDepois?.metros ?? 0;

            return `
                <article class="historicoItem">
                    <strong>${htmlSeguro(tipo)} - ${htmlSeguro(item.usuario || "Usuario")}</strong>
                    <span>${htmlSeguro(acao)} | ${htmlSeguro(quantidade)} metros</span>
                    <small>Data: ${htmlSeguro(item.data || "-")} | Hora: ${htmlSeguro(item.hora || "-")}</small>
                    <small>${htmlSeguro(detalhes(item))}</small>
                </article>
            `;
        }).join("");
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
            lista.innerHTML = `<p>${htmlSeguro(error.message || error)}</p>`;
        });

        window.AtlasFirebase.observarHistoricoAgropainel((itens)=>{
            historicosAgropainel = itens;
            status.innerText = "Historico atualizado.";
            renderizarHistorico();
        }, (error)=>{
            status.innerText = "Erro ao carregar historico do Agropainel.";
            lista.innerHTML = `<p>${htmlSeguro(error.message || error)}</p>`;
        });
    }

    async function salvarBobinaFirestore(resultado, observacao){
        if(!window.AtlasFirebase){
            status.innerText = "Firebase nao carregado.";
            return;
        }

        status.innerText = "A salvar...";
        try{
            await window.AtlasFirebase.salvarCalculoBobina({
                ...resultado,
                usuario: nomeUsuario(),
                acao: "producao",
                observacao: observacao || resultado.observacao
            });
            status.innerText = "Salvo no historico_bobina.";
        }catch(error){
            status.innerText = `Erro ao salvar: ${error.message || error}`;
        }
    }

    async function salvarAgropainelFirestore(resultado, observacao){
        if(!window.AtlasFirebase){
            status.innerText = "Firebase nao carregado.";
            return;
        }

        status.innerText = "A salvar...";
        try{
            const antes = JSON.parse(localStorage.getItem("ultimoAgropainel") || "null");
            await window.AtlasFirebase.salvarCalculoAgropainel({
                ...resultado,
                usuario: nomeUsuario(),
                acao: "producao",
                observacao: observacao || resultado.observacao
            }, antes);
            localStorage.setItem("ultimoAgropainel", JSON.stringify(resultado));
            status.innerText = "Salvo no historico_agropainel.";
        }catch(error){
            status.innerText = `Erro ao salvar: ${error.message || error}`;
        }
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

    salvarBobina.addEventListener("click", ()=>salvarBobinaFirestore(resultadoBobina()));
    salvarAgro.addEventListener("click", ()=>salvarAgropainelFirestore(resultadoAgropainel()));
    testarBancoBtn.addEventListener("click", testarBanco);

    window.AtlasHistorico = {
        resultadoBobina,
        resultadoAgropainel,
        salvarBobinaFirestore,
        salvarAgropainelFirestore
    };

    iniciarHistorico();
});
