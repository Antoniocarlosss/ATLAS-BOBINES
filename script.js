// =========================
// Preencher seleção de largura (1 a 50 cm de 0.5 em 0.5)
const selectLargura = document.getElementById("largura");
for(let i = 1; i <= 40; i += 0.5){
    let option = document.createElement("option");
    option.value = i;

    // mostrar inteiro sem decimal, .5 com decimal
    option.text = (i % 1 === 0) ? i + " cm" : i.toFixed(1) + " cm";

    selectLargura.appendChild(option);
}

// =========================
// Criar botões de espessura
const espDiv = document.getElementById("espessuras");
const espessuras = [0.28,0.32,0.35,0.38,0.40,0.45,0.50,0.60,0.68];
let espSelecionada = 0.32; // padrão

espessuras.forEach(e => {
    let btn = document.createElement("button");
   btn.innerHTML = `<img src="https://img.icons8.com/dotty/80/line-width.png" style="width:18px;height:18px;margin-right:5px;"> ${e} mm`;

    btn.onclick = function() {
        // remove seleção de todos
        espDiv.querySelectorAll("button").forEach(b => b.classList.remove("selecionado"));
        // adiciona seleção neste botão
        btn.classList.add("selecionado");

        espSelecionada = e;
        calcular();
    };

    espDiv.appendChild(btn);
});

// =========================
// Criar botões de velocidade
const velDiv = document.getElementById("velocidades");
const velocidades = [5,6,7,8,9,10,11,12];
let velSelecionada = 10; // padrão

velocidades.forEach(v => {
    let btn = document.createElement("button");
    btn.innerHTML = `<img src="https://img.icons8.com/color/48/speed.png" style="width:18px;height:18px;margin-right:5px;"> ${v} m/min`;

    btn.onclick = function() {
        // remove seleção de todos
        velDiv.querySelectorAll("button").forEach(b => b.classList.remove("selecionado"));
        // adiciona seleção neste botão
        btn.classList.add("selecionado");

        velSelecionada = v;
        calcular();
    };

    velDiv.appendChild(btn);
});

// =========================
// Função de cálculo
function calcular() {
    const interno = 500; // mm
    const pi = 3.14;

    const largura_cm = parseFloat(selectLargura.value);
    const espessura = parseFloat(espSelecionada);
    const velocidade = parseFloat(velSelecionada);

    if(isNaN(largura_cm) || isNaN(espessura) || largura_cm <=0 || espessura <=0){
        alert("Valores inválidos!");
        return;
    }

    const largura_mm = largura_cm * 10; // cm → mm

    // Passo 1
    const passo1 = largura_mm / espessura;

    // Passo 2
    const passo2 = passo1 * pi;

    // Passo 3
    const soma_interno_largura = interno + largura_mm;

    // Passo 4
    const metros_mm = passo2 * soma_interno_largura; // ainda em mm
    const metros = Math.round(metros_mm / 1000); // converter para metros

    // Tempo
    const tempo_total_min = Math.round(metros / velocidade); // minutos
    const horas = Math.floor(tempo_total_min / 60);
    const minutos = tempo_total_min % 60;

    // Hora final
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + tempo_total_min);

    // Mostrar resultados
    document.getElementById("passos").innerHTML = `
Passo 1: ${largura_mm} / ${espessura} = ${passo1.toFixed(2)}<br>
Passo 2: ${passo1.toFixed(2)} × ${pi} = ${passo2.toFixed(2)}<br>
Passo 3: ${interno} + ${largura_mm} = ${soma_interno_largura}<br>
Passo 4: ${passo2.toFixed(2)} × ${soma_interno_largura} = ${metros} metros
`;

    document.getElementById("metros").innerText = "Metros de bobina: " + metros;

    if(horas > 0){
        document.getElementById("tempo").innerText = `Tempo para acabar: ${horas} h e ${minutos} min`;
    } else {
        document.getElementById("tempo").innerText = `Tempo para acabar: ${minutos} min`;
    }

    document.getElementById("hora").innerText = "Vai acabar por volta das: " + agora.toLocaleTimeString();
}

// =========================
// Opcional: chamar calcular no início para mostrar resultado padrão
calcular();
