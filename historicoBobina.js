document.addEventListener("DOMContentLoaded", ()=>{
    const lista = document.getElementById("historicoBobinaLista");
    const status = document.getElementById("historicoBobinaStatus");
    const chave = "atlas_historico_bobina";
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
        return `${data.toLocaleDateString("pt-PT", {day:"2-digit", month:"2-digit"})} - ${data.toLocaleTimeString("pt-PT", {hour:"2-digit", minute:"2-digit"})}`;
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
            lista.innerHTML = "<p>Nenhuma bobina salva ainda.</p>";
            return;
        }

        lista.innerHTML = itens.map((item)=>`
            <article class="historicoItem historicoItemBobina historicoItemCompacto">
                <strong>${htmlSeguro(item.usuario || "Usuario")}</strong>
                <small>${htmlSeguro(formatarMomento(item.criadoEmLocal))}</small>
                <span>${htmlSeguro(formatarNumero(item.espessuraMm))} mm</span>
                <span>${htmlSeguro(formatarNumero(item.velocidade))} m/min</span>
                <span>${htmlSeguro(formatarNumero(item.metros))} m</span>
            </article>
        `).join("");
    }

    function salvarLocal(dados){
        const item = {
            usuario: dados.usuario || localStorage.getItem("nomeUsuario") || "Usuario",
            criadoEmLocal: new Date().toISOString(),
            espessuraMm: Number(dados.espessuraMm || 0),
            velocidade: Number(dados.velocidade || 0),
            metros: Number(dados.metros || 0)
        };
        const assinatura = JSON.stringify({
            usuario: item.usuario,
            espessuraMm: item.espessuraMm,
            velocidade: item.velocidade,
            metros: item.metros
        });

        if(assinatura === ultimaAssinatura) return;
        ultimaAssinatura = assinatura;

        gravar([item, ...carregar()]);
        renderizar();
        if(status) status.innerText = "Salvo automaticamente";

        if(window.AtlasFirebase){
            window.AtlasFirebase.registrarHistoricoBobina("calculo automatico", {
                ...dados,
                usuario: item.usuario,
                produtoBobina: "Bobina",
                quantidade: item.metros,
                observacao: "Salvo automaticamente na aba Bobina."
            }).catch(()=>{});
        }
    }

    window.addEventListener("atlas:bobina-calculada", (event)=>{
        salvarLocal(event.detail || {});
    });

    renderizar();
});
