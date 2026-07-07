window.ATLAS_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC0SrD268LbO-7cmNCwYf72AXOSFVL0TqQ",
    authDomain: "atlas-bobina.firebaseapp.com",
    projectId: "atlas-bobina",
    storageBucket: "atlas-bobina.firebasestorage.app",
    messagingSenderId: "352865662588",
    appId: "1:352865662588:web:462be42c61c2665ceb7bf9",
    measurementId: "G-5JG3M88ZLN"
};

(function(){
    const COLECOES = {
        usuarios: "usuarios",
        calculosBobina: "calculos_bobina",
        calculosAgropainel: "calculos_agropainel",
        historicoBobina: "historico_bobina",
        historicoAgropainel: "historico_agropainel",
        testes: "testes_banco"
    };

    function iniciarFirebase(){
        if(!window.firebase){
            throw new Error("SDK do Firebase nao carregado. Verifique a conexao com a internet.");
        }

        if(!window.firebase.apps.length){
            window.firebase.initializeApp(window.ATLAS_FIREBASE_CONFIG);
        }

        const db = window.firebase.firestore();
        let analytics = null;

        if(window.firebase.analytics && window.location.protocol !== "file:"){
            analytics = window.firebase.analytics();
        }

        window.atlasHistoricoDb = db;
        return { db, analytics };
    }

    const firebaseApp = iniciarFirebase();

    function serverTimestamp(){
        return window.firebase.firestore.FieldValue.serverTimestamp();
    }

    function dataHoraAtual(){
        const agora = new Date();
        return {
            iso: agora.toISOString(),
            data: agora.toLocaleDateString("pt-PT"),
            hora: agora.toLocaleTimeString("pt-PT", {hour:"2-digit", minute:"2-digit", second:"2-digit"})
        };
    }

    function usuarioAtual(){
        return localStorage.getItem("nomeUsuario") || "Usuario";
    }

    function limparIndefinidos(valor){
        if(Array.isArray(valor)){
            return valor.map(limparIndefinidos);
        }

        if(valor && typeof valor === "object"){
            return Object.keys(valor).reduce((objeto, chave)=>{
                if(valor[chave] !== undefined){
                    objeto[chave] = limparIndefinidos(valor[chave]);
                }
                return objeto;
            }, {});
        }

        return valor;
    }

    function montarHistoricoBobina(acao, dados){
        const momento = dataHoraAtual();
        return limparIndefinidos({
            data: momento.data,
            hora: momento.hora,
            tipoAcao: acao,
            usuario: dados.usuario || usuarioAtual(),
            produtoBobina: dados.produtoBobina || dados.produto || dados.tipo || "Bobina",
            quantidade: Number(dados.quantidade ?? dados.metros ?? 0),
            observacao: dados.observacao || "",
            valores: dados,
            criadoEmLocal: momento.iso,
            criadoEm: serverTimestamp()
        });
    }

    function montarHistoricoAgropainel(acao, antes, depois, usuario){
        const momento = dataHoraAtual();
        return limparIndefinidos({
            data: momento.data,
            hora: momento.hora,
            acaoRealizada: acao,
            valoresAntes: antes || null,
            valoresDepois: depois || null,
            usuario: usuario || usuarioAtual(),
            criadoEmLocal: momento.iso,
            criadoEm: serverTimestamp()
        });
    }

    async function registrarHistoricoBobina(acao, dados = {}){
        const historico = montarHistoricoBobina(acao, dados);
        return firebaseApp.db.collection(COLECOES.historicoBobina).add(historico);
    }

    async function registrarHistoricoAgropainel(acao, antes = null, depois = null, usuario){
        const historico = montarHistoricoAgropainel(acao, antes, depois, usuario);
        return firebaseApp.db.collection(COLECOES.historicoAgropainel).add(historico);
    }

    async function salvarUsuario(dados){
        const usuario = limparIndefinidos({
            nome: dados.nome,
            idioma: dados.idioma,
            ultimoAcessoLocal: new Date().toISOString(),
            atualizadoEm: serverTimestamp()
        });

        await firebaseApp.db.collection(COLECOES.usuarios).doc(dados.nome).set(usuario, { merge: true });
        return usuario;
    }

    async function salvarCalculoBobina(dados){
        const payload = limparIndefinidos({
            ...dados,
            usuario: dados.usuario || usuarioAtual(),
            criadoEmLocal: new Date().toISOString(),
            criadoEm: serverTimestamp()
        });

        const doc = await firebaseApp.db.collection(COLECOES.calculosBobina).add(payload);
        await registrarHistoricoBobina(dados.acao || "producao", {
            ...payload,
            produtoBobina: "Bobina",
            quantidade: payload.metros,
            observacao: dados.observacao || "Calculo de bobina salvo."
        });
        return doc;
    }

    async function salvarCalculoAgropainel(dados, antes = null){
        const payload = limparIndefinidos({
            ...dados,
            usuario: dados.usuario || usuarioAtual(),
            criadoEmLocal: new Date().toISOString(),
            criadoEm: serverTimestamp()
        });

        const doc = await firebaseApp.db.collection(COLECOES.calculosAgropainel).add(payload);
        await registrarHistoricoAgropainel(dados.acao || "producao", antes, payload, payload.usuario);
        return doc;
    }

    function observarHistoricos(callback, onError){
        return firebaseApp.db.collection(COLECOES.historicoBobina)
            .orderBy("criadoEm", "desc")
            .limit(50)
            .onSnapshot((snapshot)=>{
                callback(snapshot.docs.map((doc)=>({ id: doc.id, origem: "bobina", ...doc.data() })));
            }, onError);
    }

    function observarHistoricoAgropainel(callback, onError){
        return firebaseApp.db.collection(COLECOES.historicoAgropainel)
            .orderBy("criadoEm", "desc")
            .limit(50)
            .onSnapshot((snapshot)=>{
                callback(snapshot.docs.map((doc)=>({ id: doc.id, origem: "agropainel", ...doc.data() })));
            }, onError);
    }

    async function testarBanco(){
        const teste = {
            mensagem: "Teste de conexao Firebase ATLAS BOBINES",
            usuario: usuarioAtual(),
            criadoEmLocal: new Date().toISOString(),
            criadoEm: serverTimestamp()
        };

        const referencia = await firebaseApp.db.collection(COLECOES.testes).add(teste);
        const leitura = await referencia.get();

        if(!leitura.exists){
            throw new Error("Documento de teste foi criado, mas nao foi encontrado na leitura.");
        }

        return { id: referencia.id, dados: leitura.data() };
    }

    window.AtlasFirebase = {
        colecoes: COLECOES,
        db: firebaseApp.db,
        analytics: firebaseApp.analytics,
        testarBanco,
        salvarUsuario,
        salvarCalculoBobina,
        salvarCalculoAgropainel,
        registrarHistoricoBobina,
        registrarHistoricoAgropainel,
        observarHistoricos,
        observarHistoricoAgropainel
    };
})();
