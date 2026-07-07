document.addEventListener("DOMContentLoaded", ()=>{
    const testarBancoBtn = document.getElementById("testarBancoBtn");
    const mensagem = document.getElementById("firebaseTesteMensagem");

    if(!testarBancoBtn || !mensagem) return;

    function bancoConfigurado(){
        return Boolean(window.AtlasFirebase && window.AtlasFirebase.db);
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

            await window.AtlasFirebase.testarBanco();
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
