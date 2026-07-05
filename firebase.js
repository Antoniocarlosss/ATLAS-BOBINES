window.ATLAS_FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

(function(){
    const config = window.ATLAS_FIREBASE_CONFIG || {}
    const firebaseConfigurado = config.apiKey && config.projectId && window.firebase

    if(!firebaseConfigurado){
        window.atlasHistoricoDb = null
        return
    }

    if(!window.firebase.apps.length){
        window.firebase.initializeApp(config)
    }

    window.atlasHistoricoDb = window.firebase.firestore()
})()
