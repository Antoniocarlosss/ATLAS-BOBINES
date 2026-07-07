document.addEventListener("DOMContentLoaded", ()=>{
    const lista = document.getElementById("historicoAgropainelLista");
    const status = document.getElementById("historicoAgropainelStatus");
    const chave = "atlas_historico_agropainel";
    let ultimaAssinatura = "";

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

    function carregar(){
        try{
            return JSON.parse(localStorage.getItem(chave) || "[]");
        }catch(error){
            return [];
        }
    }

    function gravar(itens){
        localStorage.setItem(chave, JSON.stringify(itens.slice(0, 10)));
    }

    function renderizar(){
        const itens = carregar();

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

    function salvarLocal(dados){
        if(!dados || !dados.espessuraMm || !dados.velocidade || !dados.metros) return;

        const item = {
            usuario: dados.usuario || localStorage.getItem("nomeUsuario") || "Usuario",
            criadoEmLocal: new Date().toISOString(),
            espessuraMm: Number(dados.espessuraMm || 0.60),
            velocidade: Number(dados.velocidade || 0),
            metros: Number(dados.metros || 0)
        };
        const assinatura = JSON.stringify({
            usuario: item.usuario,
            espessuraMm: item.espessuraMm,
            velocidade: item.velocidade,
            metros: item.metros
        });
        const ultimo = carregar()[0];
        const ultimaAssinaturaSalva = ultimo ? JSON.stringify({
            usuario: ultimo.usuario,
            espessuraMm: Number(ultimo.espessuraMm || 0),
            velocidade: Number(ultimo.velocidade || 0),
            metros: Number(ultimo.metros || 0)
        }) : "";

        if(assinatura === ultimaAssinatura || assinatura === ultimaAssinaturaSalva) return;
        ultimaAssinatura = assinatura;

        const anterior = carregar()[0] || null;
        gravar([item, ...carregar()]);
        renderizar();
        if(status) status.innerText = "Salvo automaticamente";

        if(window.AtlasFirebase){
            window.AtlasFirebase.registrarHistoricoAgropainel("calculo automatico", anterior, {
                ...dados,
                usuario: item.usuario,
                produtoBobina: "Agropainel",
                quantidade: item.metros,
                observacao: "Salvo automaticamente na aba Agropainel."
            }, item.usuario).catch(()=>{});
        }
    }

    window.AtlasHistoricoAgropainel = {
        salvar: salvarLocal,
        renderizar,
        carregar
    };

    window.addEventListener("atlas:agropainel-calculado", (event)=>salvarLocal(event.detail || {}));

    renderizar();
});
