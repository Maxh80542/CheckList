// Captura de elementos da interface
const checklistForm = document.getElementById("checklistForm");
const concluirBtn = document.getElementById("concluirBtn");
const limparHistoricoBtn = document.getElementById("limparHistoricoBtn");
const slicerMeses = document.getElementById("slicerMeses");
const historicoContainer = document.getElementById("historicoContainer");

// Inicializar histórico (recuperar do localStorage ou iniciar vazio)
let historico = JSON.parse(localStorage.getItem("historicoChecklist")) || [];

// Atualizar histórico ao carregar a página
atualizarHistorico();
preencherSlicerMeses();

/**
 * Exibir ou ocultar campos de observação para itens marcados como "Ruim"
 */
document.querySelectorAll(".ruim-option").forEach(radio => {
    radio.addEventListener("change", function () {
        const container = this.closest(".checklist-item").querySelector(".observacao-container");
        if (this.checked) {
            container.style.display = "block"; // Mostrar campo de observação
        }
    });
});

document.querySelectorAll("input[type=radio][value=Bom]").forEach(radio => {
    radio.addEventListener("change", function () {
        const container = this.closest(".checklist-item").querySelector(".observacao-container");
        if (this.checked) {
            container.style.display = "none"; // Ocultar campo de observação
            const input = container.querySelector("input");
            input.value = ""; // Limpar o campo de observação
        }
    });
});

/**
 * Obter nome abreviado do mês
 * @param {number} numeroMes - Número do mês (1-12)
 * @returns {string} Nome abreviado do mês
 */
function obterNomeMes(numeroMes) {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[numeroMes - 1];
}

/**
 * Atualizar a exibição do histórico na interface
 */
function atualizarHistorico() {
    historicoContainer.innerHTML = ""; // Limpar histórico exibido

    historico.forEach((item, index) => {
        // Criar botão para o histórico
        const btn = document.createElement("button");
        btn.textContent = `Checklist - ${item.data}`;
        btn.className = "btn";
        btn.addEventListener("click", () => toggleDetalhes(index));
        historicoContainer.appendChild(btn);

        // Detalhes do histórico
        const detalhes = document.createElement("div");
        detalhes.className = "historico-detalhes";
        detalhes.id = `detalhes-${index}`;
        detalhes.style.display = "none"; // Ocultar por padrão
        detalhes.innerHTML = `
            <h3>Relatório - ${item.data}</h3>
            <p><strong>Nome:</strong> ${item.nome}</p>
            <p><strong>Matrícula:</strong> ${item.matricula}</p>
            <p><strong>Horímetro:</strong> ${item.horimetro || "Não informado"}</p>
            ${item.itens.map(i => `
                <div class="checklist-item">
                    <p>${i.question}: <strong>${i.answer}</strong></p>
                    ${i.observacao ? `<p><em>Justificativa: ${i.observacao}</em></p>` : ""}
                </div>
            `).join("")}
            <button class="btn-download" onclick="baixarPDF(${index})">Baixar PDF</button>
        `;
        historicoContainer.appendChild(detalhes);
    });

    // Atualizar histórico no localStorage
    localStorage.setItem("historicoChecklist", JSON.stringify(historico));
}

/**
 * Preencher o seletor de meses com opções únicas
 */
function preencherSlicerMeses() {
    const mesesUnicos = [...new Set(historico.map(item => {
        const [dia, mes, ano] = item.data.split(" ")[0].split("/");
        return `${obterNomeMes(mes)}-${ano}`;
    }))];

    slicerMeses.innerHTML = '<option value="">Todos os meses</option>'; // Resetar seletor
    mesesUnicos.forEach(mes => {
        const option = document.createElement("option");
        option.value = mes;
        option.textContent = mes;
        slicerMeses.appendChild(option);
    });
}

/**
 * Alternar exibição dos detalhes do checklist
 * @param {number} index - Índice do checklist no histórico
 */
function toggleDetalhes(index) {
    const detalhes = document.getElementById(`detalhes-${index}`);
    const outrosDetalhes = document.querySelectorAll(".historico-detalhes");

    outrosDetalhes.forEach(d => {
        if (d !== detalhes) d.style.display = "none";
    });

    detalhes.style.display = detalhes.style.display === "block" ? "none" : "block";
}

/**
 * Salvar checklist ao clicar no botão "Concluir"
 */
concluirBtn.addEventListener("click", () => {
    const nomeColaborador = document.getElementById("nomeColaborador").value.trim();
    const matriculaColaborador = document.getElementById("matriculaColaborador").value.trim();
    const horimetro = document.getElementById("horimetro").value.trim();

    if (!nomeColaborador || !matriculaColaborador || !horimetro) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return;
    }

    const itensSelecionados = Array.from(checklistForm.elements)
        .filter(el => el.type === "radio" && el.checked)
        .map(el => {
            const question = el.name;
            const answer = el.value;
            const observacaoContainer = el.closest(".checklist-item").querySelector(".observacao-container");
            const observacao = observacaoContainer ? observacaoContainer.querySelector("input").value.trim() : "";

            return { question, answer, observacao };
        });

    if (itensSelecionados.length === 0) {
        alert("Preencha ao menos um item do checklist!");
        return;
    }

    const dataAtual = new Date().toLocaleString("pt-BR");
    historico.unshift({
        data: dataAtual,
        nome: nomeColaborador,
        matricula: matriculaColaborador,
        horimetro: horimetro,
        itens: itensSelecionados,
    });

    atualizarHistorico();
    preencherSlicerMeses();
    checklistForm.reset();
    alert("Checklist salvo com sucesso!");
});

/**
 * Limpar histórico com validação de senha
 */
limparHistoricoBtn.addEventListener("click", () => {
    const confirmar = confirm("Deseja realmente limpar todo o histórico?");
    if (confirmar) {
        const senha = prompt("Digite a senha do administrador:");
        if (senha === "20041982") {
            historico = []; // Limpar histórico
            localStorage.removeItem("historicoChecklist"); // Remover do localStorage
            atualizarHistorico(); // Atualizar a interface
            preencherSlicerMeses();
            alert("Histórico apagado com sucesso!");
        } else {
            alert("Senha incorreta. Ação cancelada.");
        }
    }
});
