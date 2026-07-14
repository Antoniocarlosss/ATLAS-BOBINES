import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0SrD268LbO-7cmNCwYf72AXOSFVL0TqQ",
  authDomain: "atlas-bobina.firebaseapp.com",
  projectId: "atlas-bobina",
  storageBucket: "atlas-bobina.firebasestorage.app",
  messagingSenderId: "352865662588",
  appId: "1:352865662588:web:462be42c61c2665ceb7bf9",
  measurementId: "G-5JG3M88ZLN"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);
analyticsIsSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp);
}).catch(() => {});

const STORAGE = {
  operator: "atlas_operator_name",
  history: "atlas_calc_history",
  language: "atlas_language"
};

const translations = {
  pt: { lang: "pt-BR", brand: "Sistema ATLAS", title: "Calculadora de Bobines", install: "Instalar", currentTime: "Hora atual", temperature: "Temperatura", language: "Idioma", operatorName: "Nome do operador", namePlaceholder: "Digite seu nome", enter: "Entrar", nameHelp: "O nome fica salvo apenas neste celular.", change: "Trocar", bobina: "Bobina", agropainel: "Agropainel", outerWidth: "Largura externa", flapWidth: "Largura da aba", thickness: "Espessura da chapa", speed: "Velocidade da maquina", remaining: "Falta para acabar", timeLeft: "Tempo restante", endsAt: "Acaba as", saveHistory: "Salvar no historico", agroFixed: "Espessura fixa 0.60 mm | Interno 200", localHistory: "Historico local", lastCalculations: "Ultimos calculos", clear: "Limpar", emptyHistory: "Nenhum calculo salvo ainda.", goodMorning: "Bom dia", goodAfternoon: "Boa tarde", goodNight: "Boa noite", operator: "Operador", clearQuestion: "Limpar historico deste celular?", installIos: "No iPhone, toque em Compartilhar e depois em Adicionar a Tela de Inicio.", installHelp: "Abra o menu do navegador e toque em Instalar app ou Adicionar a tela inicial.", tempUnavailable: "Sem temp." },
  en: { lang: "en", brand: "ATLAS System", title: "Coil Calculator", install: "Install", currentTime: "Current time", temperature: "Temperature", language: "Language", operatorName: "Operator name", namePlaceholder: "Enter your name", enter: "Enter", nameHelp: "The name is saved only on this phone.", change: "Change", bobina: "Coil", agropainel: "Agropanel", outerWidth: "Outer width", flapWidth: "Flap width", thickness: "Sheet thickness", speed: "Machine speed", remaining: "Remaining", timeLeft: "Time left", endsAt: "Ends at", saveHistory: "Save to history", agroFixed: "Fixed thickness 0.60 mm | Inner 200", localHistory: "Local history", lastCalculations: "Last calculations", clear: "Clear", emptyHistory: "No calculation saved yet.", goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodNight: "Good evening", operator: "Operator", clearQuestion: "Clear history from this phone?", installIos: "On iPhone, tap Share and then Add to Home Screen.", installHelp: "Open the browser menu and tap Install app or Add to home screen.", tempUnavailable: "No temp." },
  hi: { lang: "hi", brand: "ATLAS सिस्टम", title: "कॉइल कैलकुलेटर", install: "इंस्टॉल", currentTime: "वर्तमान समय", temperature: "तापमान", language: "भाषा", operatorName: "ऑपरेटर नाम", namePlaceholder: "अपना नाम लिखें", enter: "प्रवेश", nameHelp: "नाम केवल इस मोबाइल में सेव होगा.", change: "बदलें", bobina: "कॉइल", agropainel: "एग्रोपैनल", outerWidth: "बाहरी चौड़ाई", flapWidth: "फ्लैप चौड़ाई", thickness: "शीट मोटाई", speed: "मशीन गति", remaining: "बाकी", timeLeft: "समय बाकी", endsAt: "समाप्त होगा", saveHistory: "इतिहास में सेव करें", agroFixed: "स्थिर मोटाई 0.60 mm | अंदर 200", localHistory: "स्थानीय इतिहास", lastCalculations: "अंतिम गणना", clear: "साफ करें", emptyHistory: "अभी कोई गणना सेव नहीं.", goodMorning: "सुप्रभात", goodAfternoon: "नमस्ते", goodNight: "शुभ रात्री", operator: "ऑपरेटर", clearQuestion: "इस मोबाइल का इतिहास साफ करें?", installIos: "iPhone पर Share दबाएं और Add to Home Screen चुनें.", installHelp: "ब्राउज़र मेनू खोलें और Install app या Add to home screen चुनें.", tempUnavailable: "तापमान नहीं" },
  bn: { lang: "bn", brand: "ATLAS সিস্টেম", title: "কয়েল ক্যালকুলেটর", install: "ইনস্টল", currentTime: "বর্তমান সময়", temperature: "তাপমাত্রা", language: "ভাষা", operatorName: "অপারেটরের নাম", namePlaceholder: "আপনার নাম লিখুন", enter: "প্রবেশ", nameHelp: "নাম শুধু এই মোবাইলে সংরক্ষিত হবে.", change: "বদলান", bobina: "কয়েল", agropainel: "এগ্রোপ্যানেল", outerWidth: "বাইরের প্রস্থ", flapWidth: "ফ্ল্যাপ প্রস্থ", thickness: "শীটের পুরুত্ব", speed: "মেশিন গতি", remaining: "বাকি", timeLeft: "সময় বাকি", endsAt: "শেষ হবে", saveHistory: "ইতিহাসে সংরক্ষণ", agroFixed: "স্থির পুরুত্ব 0.60 mm | ভিতর 200", localHistory: "স্থানীয় ইতিহাস", lastCalculations: "শেষ হিসাব", clear: "মুছুন", emptyHistory: "এখনো কোনো হিসাব সংরক্ষিত নেই.", goodMorning: "শুভ সকাল", goodAfternoon: "শুভ অপরাহ্ন", goodNight: "শুভ রাত্রি", operator: "অপারেটর", clearQuestion: "এই মোবাইলের ইতিহাস মুছবেন?", installIos: "iPhone এ Share চাপুন, তারপর Add to Home Screen.", installHelp: "ব্রাউজার মেনু খুলে Install app বা Add to home screen চাপুন.", tempUnavailable: "তাপ নেই" },
  te: { lang: "te", brand: "ATLAS సిస్టమ్", title: "కాయిల్ కాలిక్యులేటర్", install: "ఇన్‌స్టాల్", currentTime: "ప్రస్తుత సమయం", temperature: "ఉష్ణోగ్రత", language: "భాష", operatorName: "ఆపరేటర్ పేరు", namePlaceholder: "మీ పేరు రాయండి", enter: "ప్రవేశం", nameHelp: "పేరు ఈ ఫోన్‌లో మాత్రమే సేవ్ అవుతుంది.", change: "మార్చు", bobina: "కాయిల్", agropainel: "అగ్రోప్యానెల్", outerWidth: "బయటి వెడల్పు", flapWidth: "ఫ్లాప్ వెడల్పు", thickness: "షీట్ మందం", speed: "మెషిన్ వేగం", remaining: "మిగిలింది", timeLeft: "మిగిలిన సమయం", endsAt: "ముగిసే సమయం", saveHistory: "చరిత్రలో సేవ్", agroFixed: "స్థిర మందం 0.60 mm | లోపలి 200", localHistory: "లోకల్ చరిత్ర", lastCalculations: "చివరి లెక్కలు", clear: "తొలగించు", emptyHistory: "ఇంకా లెక్క సేవ్ కాలేదు.", goodMorning: "శుభోదయం", goodAfternoon: "శుభ మధ్యాహ్నం", goodNight: "శుభ రాత్రి", operator: "ఆపరేటర్", clearQuestion: "ఈ ఫోన్ చరిత్ర తొలగించాలా?", installIos: "iPhone లో Share నొక్కి Add to Home Screen ఎంచుకోండి.", installHelp: "బ్రౌజర్ మెనులో Install app లేదా Add to home screen ఎంచుకోండి.", tempUnavailable: "ఉష్ణం లేదు" },
  mr: { lang: "mr", brand: "ATLAS प्रणाली", title: "कॉइल कॅल्क्युलेटर", install: "इंस्टॉल", currentTime: "सध्याची वेळ", temperature: "तापमान", language: "भाषा", operatorName: "ऑपरेटर नाव", namePlaceholder: "तुमचे नाव लिहा", enter: "प्रवेश", nameHelp: "नाव फक्त या मोबाइलमध्ये सेव होईल.", change: "बदला", bobina: "कॉइल", agropainel: "अॅग्रोपॅनल", outerWidth: "बाहेरील रुंदी", flapWidth: "फ्लॅप रुंदी", thickness: "शीट जाडी", speed: "मशीन वेग", remaining: "बाकी", timeLeft: "उरलेला वेळ", endsAt: "समाप्त होईल", saveHistory: "इतिहासात सेव", agroFixed: "स्थिर जाडी 0.60 mm | आत 200", localHistory: "स्थानिक इतिहास", lastCalculations: "शेवटचे हिशोब", clear: "साफ करा", emptyHistory: "अजून कोणताही हिशोब सेव नाही.", goodMorning: "शुभ प्रभात", goodAfternoon: "शुभ दुपार", goodNight: "शुभ रात्री", operator: "ऑपरेटर", clearQuestion: "या मोबाइलचा इतिहास साफ करायचा?", installIos: "iPhone वर Share दाबा आणि Add to Home Screen निवडा.", installHelp: "ब्राउझर मेनू उघडा आणि Install app किंवा Add to home screen निवडा.", tempUnavailable: "तापमान नाही" },
  ta: { lang: "ta", brand: "ATLAS அமைப்பு", title: "காயில் கணிப்பான்", install: "நிறுவு", currentTime: "தற்போதைய நேரம்", temperature: "வெப்பநிலை", language: "மொழி", operatorName: "ஆபரேட்டர் பெயர்", namePlaceholder: "உங்கள் பெயரை எழுதுங்கள்", enter: "உள் நுழை", nameHelp: "பெயர் இந்த மொபைலில் மட்டும் சேமிக்கப்படும்.", change: "மாற்று", bobina: "காயில்", agropainel: "அக்ரோபேனல்", outerWidth: "வெளி அகலம்", flapWidth: "ஃபிளாப் அகலம்", thickness: "தாள் தடிமன்", speed: "இயந்திர வேகம்", remaining: "மீதம்", timeLeft: "மீதமுள்ள நேரம்", endsAt: "முடியும் நேரம்", saveHistory: "வரலாற்றில் சேமி", agroFixed: "நிலையான தடிமன் 0.60 mm | உள்ளே 200", localHistory: "உள்ளூர் வரலாறு", lastCalculations: "கடைசி கணக்குகள்", clear: "அழி", emptyHistory: "இன்னும் கணக்கு சேமிக்கப்படவில்லை.", goodMorning: "காலை வணக்கம்", goodAfternoon: "மதிய வணக்கம்", goodNight: "இரவு வணக்கம்", operator: "ஆபரேட்டர்", clearQuestion: "இந்த மொபைல் வரலாற்றை அழிக்கவா?", installIos: "iPhone இல் Share ஐத் தொட்டு Add to Home Screen தேர்வுசெய்க.", installHelp: "பிரௌசர் மெனுவில் Install app அல்லது Add to home screen தேர்வுசெய்க.", tempUnavailable: "வெப்பம் இல்லை" },
  ur: { lang: "ur", brand: "ATLAS سسٹم", title: "کوائل کیلکولیٹر", install: "انسٹال", currentTime: "موجودہ وقت", temperature: "درجہ حرارت", language: "زبان", operatorName: "آپریٹر نام", namePlaceholder: "اپنا نام لکھیں", enter: "داخل", nameHelp: "نام صرف اس موبائل میں محفوظ ہوگا.", change: "تبدیل", bobina: "کوائل", agropainel: "ایگرو پینل", outerWidth: "بیرونی چوڑائی", flapWidth: "فلیپ چوڑائی", thickness: "شیٹ موٹائی", speed: "مشین رفتار", remaining: "باقی", timeLeft: "وقت باقی", endsAt: "ختم ہوگا", saveHistory: "تاریخ میں محفوظ", agroFixed: "مقررہ موٹائی 0.60 mm | اندر 200", localHistory: "مقامی تاریخ", lastCalculations: "آخری حساب", clear: "صاف", emptyHistory: "ابھی کوئی حساب محفوظ نہیں.", goodMorning: "صبح بخیر", goodAfternoon: "آداب", goodNight: "شب بخیر", operator: "آپریٹر", clearQuestion: "اس موبائل کی تاریخ صاف کریں؟", installIos: "iPhone پر Share دبائیں پھر Add to Home Screen.", installHelp: "براؤزر مینو کھولیں اور Install app یا Add to home screen منتخب کریں.", tempUnavailable: "درجہ نہیں" },
  gu: { lang: "gu", brand: "ATLAS સિસ્ટમ", title: "કોઇલ કેલ્ક્યુલેટર", install: "ઇન્સ્ટોલ", currentTime: "હાલનો સમય", temperature: "તાપમાન", language: "ભાષા", operatorName: "ઓપરેટર નામ", namePlaceholder: "તમારું નામ લખો", enter: "પ્રવેશ", nameHelp: "નામ ફક્ત આ મોબાઇલમાં સેવ થશે.", change: "બદલો", bobina: "કોઇલ", agropainel: "એગ્રોપેનલ", outerWidth: "બાહ્ય પહોળાઈ", flapWidth: "ફ્લેપ પહોળાઈ", thickness: "શીટ જાડાઈ", speed: "મશીન ગતિ", remaining: "બાકી", timeLeft: "બાકી સમય", endsAt: "પૂર્ણ થશે", saveHistory: "ઇતિહાસમાં સેવ", agroFixed: "નિશ્ચિત જાડાઈ 0.60 mm | અંદર 200", localHistory: "સ્થાનિક ઇતિહાસ", lastCalculations: "છેલ્લા હિસાબ", clear: "સાફ", emptyHistory: "હજુ કોઈ હિસાબ સેવ નથી.", goodMorning: "સુપ્રભાત", goodAfternoon: "શુભ બપોર", goodNight: "શુભ રાત્રી", operator: "ઓપરેટર", clearQuestion: "આ મોબાઇલનો ઇતિહાસ સાફ કરવો?", installIos: "iPhone પર Share દબાવો અને Add to Home Screen પસંદ કરો.", installHelp: "બ્રાઉઝર મેનુમાં Install app અથવા Add to home screen પસંદ કરો.", tempUnavailable: "તાપમાન નથી" },
  kn: { lang: "kn", brand: "ATLAS ವ್ಯವಸ್ಥೆ", title: "ಕಾಯಿಲ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್", install: "ಇನ್‌ಸ್ಟಾಲ್", currentTime: "ಪ್ರಸ್ತುತ ಸಮಯ", temperature: "ತಾಪಮಾನ", language: "ಭಾಷೆ", operatorName: "ಆಪರೇಟರ್ ಹೆಸರು", namePlaceholder: "ನಿಮ್ಮ ಹೆಸರು ಬರೆಯಿರಿ", enter: "ಪ್ರವೇಶ", nameHelp: "ಹೆಸರು ಈ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ.", change: "ಬದಲಿಸಿ", bobina: "ಕಾಯಿಲ್", agropainel: "ಅಗ್ರೋಪ್ಯಾನಲ್", outerWidth: "ಹೊರಗಿನ ಅಗಲ", flapWidth: "ಫ್ಲ್ಯಾಪ್ ಅಗಲ", thickness: "ಶೀಟ್ ದಪ್ಪ", speed: "ಯಂತ್ರ ವೇಗ", remaining: "ಬಾಕಿ", timeLeft: "ಉಳಿದ ಸಮಯ", endsAt: "ಮುಗಿಯುವ ಸಮಯ", saveHistory: "ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಸಿ", agroFixed: "ಸ್ಥಿರ ದಪ್ಪ 0.60 mm | ಒಳಗೆ 200", localHistory: "ಸ್ಥಳೀಯ ಇತಿಹಾಸ", lastCalculations: "ಕೊನೆಯ ಲೆಕ್ಕಗಳು", clear: "ಅಳಿಸಿ", emptyHistory: "ಇನ್ನೂ ಲೆಕ್ಕ ಉಳಿದಿಲ್ಲ.", goodMorning: "ಶುಭೋದಯ", goodAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ", goodNight: "ಶುಭ ರಾತ್ರಿ", operator: "ಆಪರೇಟರ್", clearQuestion: "ಈ ಮೊಬೈಲ್ ಇತಿಹಾಸ ಅಳಿಸಬೇಕಾ?", installIos: "iPhone ನಲ್ಲಿ Share ಒತ್ತಿ Add to Home Screen ಆಯ್ಕೆಮಾಡಿ.", installHelp: "ಬ್ರೌಸರ್ ಮೆನುವಿನಲ್ಲಿ Install app ಅಥವಾ Add to home screen ಆಯ್ಕೆಮಾಡಿ.", tempUnavailable: "ತಾಪಮಾನ ಇಲ್ಲ" },
  ml: { lang: "ml", brand: "ATLAS സിസ്റ്റം", title: "കോയിൽ കാൽക്കുലേറ്റർ", install: "ഇൻസ്റ്റാൾ", currentTime: "ഇപ്പോഴത്തെ സമയം", temperature: "താപനില", language: "ഭാഷ", operatorName: "ഓപ്പറേറ്റർ പേര്", namePlaceholder: "നിങ്ങളുടെ പേര് എഴുതുക", enter: "പ്രവേശിക്കുക", nameHelp: "പേര് ഈ മൊബൈലിൽ മാത്രം സേവ് ചെയ്യും.", change: "മാറ്റുക", bobina: "കോയിൽ", agropainel: "അഗ്രോപാനൽ", outerWidth: "പുറത്തെ വീതി", flapWidth: "ഫ്ലാപ്പ് വീതി", thickness: "ഷീറ്റ് കനം", speed: "മെഷിൻ വേഗം", remaining: "ബാക്കി", timeLeft: "ബാക്കി സമയം", endsAt: "അവസാന സമയം", saveHistory: "ചരിത്രത്തിൽ സേവ്", agroFixed: "സ്ഥിര കനം 0.60 mm | അകത്ത് 200", localHistory: "പ്രാദേശിക ചരിത്രം", lastCalculations: "അവസാന കണക്കുകൾ", clear: "മായ്ക്കുക", emptyHistory: "ഇനിയും കണക്ക് സേവ് ചെയ്തിട്ടില്ല.", goodMorning: "സുപ്രഭാതം", goodAfternoon: "ശുഭ ഉച്ചയ്ക്ക്", goodNight: "ശുഭ രാത്രി", operator: "ഓപ്പറേറ്റർ", clearQuestion: "ഈ മൊബൈലിലെ ചരിത്രം മായ്ക്കണോ?", installIos: "iPhone ൽ Share ടാപ്പ് ചെയ്ത് Add to Home Screen തിരഞ്ഞെടുക്കുക.", installHelp: "ബ്രൗസർ മെനുവിൽ Install app അല്ലെങ്കിൽ Add to home screen തിരഞ്ഞെടുക്കുക.", tempUnavailable: "താപം ഇല്ല" },
  pa: { lang: "pa", brand: "ATLAS ਸਿਸਟਮ", title: "ਕੋਇਲ ਕੈਲਕੂਲੇਟਰ", install: "ਇੰਸਟਾਲ", currentTime: "ਮੌਜੂਦਾ ਸਮਾਂ", temperature: "ਤਾਪਮਾਨ", language: "ਭਾਸ਼ਾ", operatorName: "ਆਪਰੇਟਰ ਨਾਮ", namePlaceholder: "ਆਪਣਾ ਨਾਮ ਲਿਖੋ", enter: "ਦਾਖਲ", nameHelp: "ਨਾਮ ਸਿਰਫ ਇਸ ਮੋਬਾਈਲ ਵਿੱਚ ਸੇਵ ਹੋਵੇਗਾ.", change: "ਬਦਲੋ", bobina: "ਕੋਇਲ", agropainel: "ਐਗਰੋਪੈਨਲ", outerWidth: "ਬਾਹਰੀ ਚੌੜਾਈ", flapWidth: "ਫਲੈਪ ਚੌੜਾਈ", thickness: "ਸ਼ੀਟ ਮੋਟਾਈ", speed: "ਮਸ਼ੀਨ ਗਤੀ", remaining: "ਬਾਕੀ", timeLeft: "ਬਾਕੀ ਸਮਾਂ", endsAt: "ਖਤਮ ਹੋਵੇਗਾ", saveHistory: "ਇਤਿਹਾਸ ਵਿੱਚ ਸੇਵ", agroFixed: "ਫਿਕਸ ਮੋਟਾਈ 0.60 mm | ਅੰਦਰ 200", localHistory: "ਲੋਕਲ ਇਤਿਹਾਸ", lastCalculations: "ਆਖਰੀ ਹਿਸਾਬ", clear: "ਸਾਫ਼", emptyHistory: "ਹਾਲੇ ਕੋਈ ਹਿਸਾਬ ਸੇਵ ਨਹੀਂ.", goodMorning: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", goodAfternoon: "ਸ਼ੁਭ ਦੁਪਹਿਰ", goodNight: "ਸ਼ੁਭ ਰਾਤ", operator: "ਆਪਰੇਟਰ", clearQuestion: "ਇਸ ਮੋਬਾਈਲ ਦਾ ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰਨਾ?", installIos: "iPhone ਤੇ Share ਦਬਾਓ ਅਤੇ Add to Home Screen ਚੁਣੋ.", installHelp: "ਬਰਾਊਜ਼ਰ ਮੀਨੂ ਖੋਲ੍ਹੋ ਅਤੇ Install app ਜਾਂ Add to home screen ਚੁਣੋ.", tempUnavailable: "ਤਾਪ ਨਹੀਂ" }
};

const state = {
  mode: "bobina",
  language: localStorage.getItem(STORAGE.language) || "pt",
  operator: localStorage.getItem(STORAGE.operator) || "",
  firebaseReady: false,
  sharedHistory: null,
  temperature: "--°C",
  bobina: { largura: 10, espessura: 0.32, velocidade: 10 },
  agropainel: { largura: 15, espessura: 0.6, velocidade: 10 },
  installPrompt: null
};

const widths = Array.from({ length: 99 }, (_, index) => 1 + index * 0.5);
const thicknesses = [0.24, 0.28, 0.3, 0.32, 0.35, 0.38, 0.4, 0.43, 0.45, 0.68];
const speeds = [5, 6, 7, 8, 9, 10, 11, 12];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const t = (key) => (translations[state.language] || translations.pt)[key] || translations.pt[key] || key;

function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString(t("lang"), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function formatWidth(value) {
  return Number.isInteger(value) ? `${value} cm` : `${value.toFixed(1)} cm`;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}

function finishHour(totalMinutes) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + totalMinutes);
  return `${date.toLocaleTimeString(t("lang"), { hour: "2-digit", minute: "2-digit" })} hrs`;
}

function calculate({ largura, espessura, velocidade }, interno) {
  const larguraMm = Number(largura) * 10;
  const metros = Math.round(((larguraMm / Number(espessura)) * 3.14 * (interno + larguraMm)) / 1000);
  const minutos = Math.max(1, Math.round(metros / Number(velocidade)));
  return { metros, minutos, tempo: formatTime(minutos), hora: finishHour(minutos) };
}

function fillSelect(select, values, selected) {
  select.innerHTML = values.map((value) => {
    const optionSelected = Number(value) === Number(selected) ? " selected" : "";
    return `<option value="${value}"${optionSelected}>${formatWidth(value)}</option>`;
  }).join("");
}

function renderOptions(container, values, selected, unit, onSelect) {
  container.innerHTML = values.map((value) => {
    const active = Number(value) === Number(selected) ? " active" : "";
    const text = unit === "mm" ? `${formatNumber(value, 2)} mm` : `${value} m/min`;
    return `<button class="optionButton${active}" type="button" data-value="${value}">${text}</button>`;
  }).join("");

  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => onSelect(Number(button.dataset.value)));
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 12) return `☀ ${t("goodMorning")}`;
  if (hour >= 12 && hour < 18) return `☀ ${t("goodAfternoon")}`;
  return `☾ ${t("goodNight")}`;
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  $("#dayIcon").textContent = hour >= 8 && hour < 18 ? "☀" : "☾";
  $("#currentTime").textContent = now.toLocaleTimeString(t("lang"), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  $("#temperature").textContent = state.temperature;
  $("#greeting").textContent = getGreeting();
}

function applyLanguage() {
  const dictionary = translations[state.language] || translations.pt;
  document.documentElement.lang = dictionary.lang;
  document.documentElement.dir = state.language === "ur" ? "rtl" : "ltr";
  $("#languageSelect").value = state.language;

  $$("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  updateOperator();
  updateTabs();
  updateBobina();
  updateAgropainel();
  renderHistory();
  updateClock();
}

function updateOperator() {
  const hasOperator = Boolean(state.operator);
  $("#operatorPanel").hidden = hasOperator;
  $("#summaryPanel").hidden = !hasOperator;
  $("#operatorLabel").textContent = state.operator;
  $("#greeting").textContent = getGreeting();
}

function updateTabs() {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === state.mode));
  $("#bobinaCalculator").classList.toggle("active", state.mode === "bobina");
  $("#agropainelCalculator").classList.toggle("active", state.mode === "agropainel");
}

function updateBobina() {
  fillSelect($("#bobinaLargura"), widths, state.bobina.largura);
  renderOptions($("#bobinaEspessuras"), thicknesses, state.bobina.espessura, "mm", (value) => {
    state.bobina.espessura = value;
    updateBobina();
  });
  renderOptions($("#bobinaVelocidades"), speeds, state.bobina.velocidade, "m/min", (value) => {
    state.bobina.velocidade = value;
    updateBobina();
  });

  const result = calculate(state.bobina, 500);
  $("#bobinaMetros").textContent = `${formatNumber(result.metros)} m`;
  $("#bobinaTempo").textContent = result.tempo;
  $("#bobinaHora").textContent = result.hora;
}

function updateAgropainel() {
  fillSelect($("#agroLargura"), widths, state.agropainel.largura);
  renderOptions($("#agroVelocidades"), speeds, state.agropainel.velocidade, "m/min", (value) => {
    state.agropainel.velocidade = value;
    updateAgropainel();
  });

  const result = calculate(state.agropainel, 200);
  $("#agroMetros").textContent = `${formatNumber(result.metros)} m`;
  $("#agroTempo").textContent = result.tempo;
  $("#agroHora").textContent = result.hora;
}

function getHistory() {
  if (Array.isArray(state.sharedHistory)) return state.sharedHistory;

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE.history) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function setHistory(items) {
  localStorage.setItem(STORAGE.history, JSON.stringify(items.slice(0, 10)));
}

function renderHistory() {
  const items = getHistory();
  const list = $("#historyList");
  if (!items.length) {
    list.innerHTML = `<p class="emptyHistory">${t("emptyHistory")}</p>`;
    return;
  }

  list.innerHTML = items.map((item) => `
    <article class="historyItem">
      <strong>${item.tipo}</strong>
      <small>${item.data}</small>
      <span>${item.metros} m | ${item.tempo} | ${item.hora}</span>
      <small>${item.operador}</small>
    </article>
  `).join("");
}

function userDocId(name) {
  return String(name || "operador").trim().toLowerCase().replace(/[^a-z0-9_-]+/gi, "_").slice(0, 80) || "operador";
}

async function saveOperatorToFirebase() {
  if (!state.operator) return;

  try {
    await setDoc(doc(firestoreDb, "usuarios", userDocId(state.operator)), {
      nome: state.operator,
      idioma: state.language,
      ultimoAcessoLocal: new Date().toISOString(),
      atualizadoEm: serverTimestamp()
    }, { merge: true });
    state.firebaseReady = true;
  } catch (error) {
    console.warn("Firebase usuarios indisponivel:", error);
  }
}

async function saveHistoryToFirebase(item, type, values, result) {
  try {
    await addDoc(collection(firestoreDb, "historico_calculos"), {
      ...item,
      calculadora: type,
      operador: state.operator || t("operator"),
      idioma: state.language,
      larguraCm: Number(values.largura),
      espessuraMm: Number(values.espessura),
      velocidade: Number(values.velocidade),
      metrosNumero: Number(result.metros),
      minutosNumero: Number(result.minutos),
      criadoEmLocal: new Date().toISOString(),
      criadoEm: serverTimestamp()
    });
    state.firebaseReady = true;
  } catch (error) {
    console.warn("Firebase historico indisponivel:", error);
  }
}

function setupFirebaseHistory() {
  try {
    const historyQuery = query(
      collection(firestoreDb, "historico_calculos"),
      orderBy("criadoEm", "desc"),
      limit(10)
    );

    onSnapshot(historyQuery, (snapshot) => {
      state.sharedHistory = snapshot.docs.map((historyDoc) => {
        const item = historyDoc.data();
        return {
          tipo: item.tipo || item.calculadora || "Calculo",
          operador: item.operador || t("operator"),
          metros: item.metros || String(item.metrosNumero || 0),
          tempo: item.tempo || "",
          hora: item.hora || "",
          data: item.data || new Date(item.criadoEmLocal || Date.now()).toLocaleString(t("lang"), {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        };
      });
      setHistory(state.sharedHistory);
      state.firebaseReady = true;
      renderHistory();
    }, (error) => {
      console.warn("Firebase leitura indisponivel:", error);
      state.sharedHistory = null;
      renderHistory();
    });
  } catch (error) {
    console.warn("Firebase setup indisponivel:", error);
  }
}

function saveCurrent(type) {
  const isBobina = type === "Bobina";
  const values = isBobina ? state.bobina : state.agropainel;
  const result = calculate(values, isBobina ? 500 : 200);
  const item = {
    tipo: isBobina ? `${t("bobina")} ${formatNumber(values.espessura, 2)} mm` : `${t("agropainel")} 0.60 mm`,
    operador: state.operator || t("operator"),
    metros: formatNumber(result.metros),
    tempo: result.tempo,
    hora: result.hora,
    data: new Date().toLocaleString(t("lang"), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  };
  const nextHistory = [item, ...getHistory()].slice(0, 10);
  if (Array.isArray(state.sharedHistory)) state.sharedHistory = nextHistory;
  setHistory(nextHistory);
  renderHistory();
  saveHistoryToFirebase(item, type, values, result);
}

function showInstallButton(show) {
  $("#installButton").style.display = show ? "inline-block" : "none";
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function setupInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    showInstallButton(true);
  });

  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    showInstallButton(false);
  });

  $("#installButton").addEventListener("click", async () => {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      const choice = await state.installPrompt.userChoice;
      if (choice.outcome === "accepted") showInstallButton(false);
      state.installPrompt = null;
      return;
    }

    alert(isIos() ? t("installIos") : t("installHelp"));
  });

  if (isIos() && !window.navigator.standalone) showInstallButton(true);
}

async function fetchTemperature(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("weather");
  const data = await response.json();
  const temp = data?.current?.temperature_2m;
  if (typeof temp !== "number") throw new Error("weather");
  state.temperature = `${Math.round(temp)}°C`;
  updateClock();
}

function setupTemperature() {
  const fallback = () => fetchTemperature(38.7223, -9.1393).catch(() => {
    state.temperature = t("tempUnavailable");
    updateClock();
  });

  if (!navigator.geolocation) {
    fallback();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => fetchTemperature(position.coords.latitude, position.coords.longitude).catch(fallback),
    fallback,
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 30 * 60 * 1000 }
  );
}

function bindEvents() {
  $("#languageSelect").addEventListener("change", (event) => {
    state.language = translations[event.target.value] ? event.target.value : "pt";
    localStorage.setItem(STORAGE.language, state.language);
    applyLanguage();
  });

  $("#saveOperator").addEventListener("click", () => {
    const name = $("#operatorName").value.trim();
    if (!name) {
      $("#operatorName").focus();
      return;
    }
    state.operator = name;
    localStorage.setItem(STORAGE.operator, name);
    updateOperator();
    saveOperatorToFirebase();
  });

  $("#operatorName").addEventListener("keydown", (event) => {
    if (event.key === "Enter") $("#saveOperator").click();
  });

  $("#changeOperator").addEventListener("click", () => {
    state.operator = "";
    localStorage.removeItem(STORAGE.operator);
    $("#operatorName").value = "";
    updateOperator();
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      updateTabs();
    });
  });

  $("#bobinaLargura").addEventListener("change", (event) => {
    state.bobina.largura = Number(event.target.value);
    updateBobina();
  });

  $("#agroLargura").addEventListener("change", (event) => {
    state.agropainel.largura = Number(event.target.value);
    updateAgropainel();
  });

  $("#saveBobina").addEventListener("click", () => saveCurrent("Bobina"));
  $("#saveAgro").addEventListener("click", () => saveCurrent("Agropainel"));
  $("#clearHistory").addEventListener("click", () => {
    if (confirm(t("clearQuestion"))) {
      setHistory([]);
      renderHistory();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("#operatorName").value = state.operator;
  bindEvents();
  setupInstall();
  setupFirebaseHistory();
  saveOperatorToFirebase();
  setupTemperature();
  applyLanguage();
  setInterval(updateClock, 1000);
});
