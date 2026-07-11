document.addEventListener("DOMContentLoaded", ()=>{
    const testarBancoBtn = document.getElementById("testarBancoBtn");
    const mensagem = document.getElementById("firebaseTesteMensagem");

    if(!testarBancoBtn || !mensagem) return;

    function bancoConfigurado(){
        return Boolean(window.AtlasFirebase && window.AtlasFirebase.db);
    }

    function comTimeout(promessa, tempoMs){
        return Promise.race([
            promessa,
            new Promise((_, rejeitar)=>{
                setTimeout(()=>rejeitar(new Error("Tempo limite excedido ao tentar conectar ao Firebase.")), tempoMs);
            })
        ]);
    }

    async function testarBanco(){
        mensagem.className = "firebaseTesteMensagem carregando";
        mensagem.innerText = "Testando banco de dados...";
        testarBancoBtn.disabled = true;

        try{
            if(!bancoConfigurado()){
                mensagem.className = "firebaseTesteMensagem aviso";
                mensagem.innerText = "⚠ Banco de dados não configurado.";
                return;
            }

            await comTimeout(window.AtlasFirebase.testarBanco(), 8000);
            mensagem.className = "firebaseTesteMensagem sucesso";
            mensagem.innerText = "✅ Banco de dados conectado com sucesso.";
        }catch(error){
            mensagem.className = "firebaseTesteMensagem erro";
            mensagem.innerText = `❌ Erro ao conectar ao banco de dados.\n${error.message || String(error)}`;
        }finally{
            testarBancoBtn.disabled = false;
        }
    }

    testarBancoBtn.addEventListener("click", testarBanco);
});
