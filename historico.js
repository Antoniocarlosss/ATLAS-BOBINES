document.addEventListener("DOMContentLoaded", ()=>{
    const lista = document.getElementById("historicoLista")
    const status = document.getElementById("historicoStatus")
    const salvarBobina = document.getElementById("salvarHistoricoBobina")
    const salvarAgro = document.getElementById("salvarHistoricoAgro")

    function texto(elemento){
        return elemento ? elemento.innerText.trim() : ""
    }

    function numeroDoTexto(valor, padrao = 0){
        const encontrado = String(valor || "").replace(",", ".").match(/\d+(\.\d+)?/)
        return encontrado ? Number(encontrado[0]) : padrao
    }

    function htmlSeguro(valor){
        return String(valor ?? "").replace(/[&<>"']/g, (char)=>({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[char]))
    }

    function nomeUsuario(){
        return localStorage.getItem("nomeUsuario") || "Usuario"
    }

    function dataHoraAtual(){
        const agora = new Date()
        return {
            iso: agora.toISOString(),
            data: agora.toLocaleDateString("pt-PT"),
            hora: agora.toLocaleTimeString("pt-PT", {hour:"2-digit", minute:"2-digit", second:"2-digit"})
        }
    }

    function botaoSelecionado(seletor, padrao){
        const botao = document.querySelector(`${seletor} button.selecionado`)
        return numeroDoTexto(texto(botao), padrao)
    }

    function resultadoBobina(){
        const largura = document.getElementById("largura")
        return {
            tipo: "bobina",
            larguraCm: Number(largura ? largura.value : 0),
            espessuraMm: botaoSelecionado("#espessuras", 0.32),
            velocidade: botaoSelecionado("#velocidades", 10),
            metros: numeroDoTexto(texto(document.getElementById("metros"))),
            tempoTexto: texto(document.getElementById("tempo")).replace(/^.*?(\d)/, "$1"),
            fimHora: texto(document.getElementById("hora")).split(": ").pop()
        }
    }

    function resultadoAgropainel(){
        const largura = document.getElementById("agroLargura")
        return {
            tipo: "agropainel",
            larguraCm: Number(largura ? largura.value : 0),
            espessuraMm: 0.60,
            velocidade: botaoSelecionado("#agroVelocidades", 10),
            metros: numeroDoTexto(texto(document.getElementById("agroMetros"))),
            tempoTexto: texto(document.getElementById("agroTempo")).replace(/^.*?(\d)/, "$1"),
            fimHora: texto(document.getElementById("agroHora")).split(": ").pop()
        }
    }

    function detalhes(item){
        return [
            item.larguraCm ? `Largura ${item.larguraCm} cm` : "",
            item.espessuraMm ? `Espessura ${item.espessuraMm} mm` : "",
            item.velocidade ? `Velocidade ${item.velocidade} m/min` : ""
        ].filter(Boolean).join(" | ")
    }

    function renderizarHistorico(itens){
        if(!itens.length){
            lista.innerHTML = "<p>Ainda nao existe historico salvo.</p>"
            return
        }

        lista.innerHTML = itens.map((item)=>{
            const tipo = item.tipo === "agropainel" ? "Bobina Agropainel" : "Bobina"
            return `
                <article class="historicoItem">
                    <strong>${htmlSeguro(tipo)} - ${htmlSeguro(item.usuario || "Usuario")}</strong>
                    <span>${htmlSeguro(item.metros || 0)} metros | ${htmlSeguro(item.tempoTexto || "-")}</span>
                    <small>Data: ${htmlSeguro(item.data || "-")} | Hora: ${htmlSeguro(item.hora || "-")}</small>
                    <small>Acaba: ${htmlSeguro(item.fimHora || "-")}</small>
                    <small>${htmlSeguro(detalhes(item))}</small>
                </article>
            `
        }).join("")
    }

    function iniciarHistorico(){
        const db = window.atlasHistoricoDb
        if(!db){
            status.innerText = "Configure o Firebase para ligar online."
            lista.innerHTML = "<p>Historico online ainda nao configurado.</p>"
            return
        }

        status.innerText = "Historico ligado."
        db.collection("atlas_bobines_historico")
            .orderBy("criadoEm", "desc")
            .limit(50)
            .onSnapshot((snapshot)=>{
                status.innerText = "Historico atualizado."
                renderizarHistorico(snapshot.docs.map((doc)=>doc.data()))
            }, ()=>{
                status.innerText = "Erro ao carregar historico."
                lista.innerHTML = "<p>Nao foi possivel carregar o historico online.</p>"
            })
    }

    async function salvar(resultado){
        const db = window.atlasHistoricoDb
        if(!db || !window.firebase){
            status.innerText = "Firebase nao configurado."
            return
        }

        const momento = dataHoraAtual()
        status.innerText = "A salvar..."

        try{
            await db.collection("atlas_bobines_historico").add({
                ...resultado,
                usuario: nomeUsuario(),
                data: momento.data,
                hora: momento.hora,
                criadoEmLocal: momento.iso,
                criadoEm: window.firebase.firestore.FieldValue.serverTimestamp()
            })
            status.innerText = "Salvo no historico."
        }catch(error){
            status.innerText = "Erro ao salvar historico."
        }
    }

    salvarBobina.addEventListener("click", ()=>salvar(resultadoBobina()))
    salvarAgro.addEventListener("click", ()=>salvar(resultadoAgropainel()))
    iniciarHistorico()
})
