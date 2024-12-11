function baixarPDF(index) {
    if (!historico || !historico[index]) {
        alert("Erro: Histórico não encontrado!");
        return;
    }

    const { data, nome, matricula, horimetro, itens } = historico[index];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Página 1: Dados Gerais e Análise
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 102, 0);
    doc.text("Relatório de Checklist de Empilhadeira", 105, 20, null, null, "center");

    // Cabeçalho
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data: ${data}`, 10, 40);
    doc.text(`Nome: ${nome}`, 10, 50);
    doc.text(`Matrícula: ${matricula}`, 10, 60);
    if (horimetro) doc.text(`Horímetro: ${horimetro}`, 10, 70);

    // Análise Geral ao lado
    const totalPerguntas = itens.length;
    const respostasBoas = itens.filter(i => i.answer === "Bom").length;
    const respostasRuins = totalPerguntas - respostasBoas;
    const porcentagemBom = ((respostasBoas / totalPerguntas) * 100).toFixed(2);
    const porcentagemRuim = (100 - porcentagemBom).toFixed(2);

    doc.text("Análise Geral:", 120, 40);
    doc.text(`Total de Perguntas: ${totalPerguntas}`, 120, 50);
    doc.text(`Bom: ${respostasBoas} (${porcentagemBom}%)`, 120, 60);
    doc.text(`Ruim: ${respostasRuins} (${porcentagemRuim}%)`, 120, 70);

    // Gráficos centralizados
    const barChartX = 60;
    const barChartY = 90;
    const barWidth = 40;
    const chartMaxHeight = 50;

    const heightBom = (respostasBoas / totalPerguntas) * chartMaxHeight;
    const heightRuim = (respostasRuins / totalPerguntas) * chartMaxHeight;

    // "Bom" gráfico de barras
    doc.setFillColor(0, 128, 0); // Verde
    doc.rect(barChartX, barChartY + (chartMaxHeight - heightBom), barWidth, heightBom, "F");
    doc.setTextColor(255, 255, 255); // Texto Branco
    doc.text(`${porcentagemBom}%`, barChartX + barWidth / 2, barChartY + (chartMaxHeight - heightBom) + 25, null, null, "center");

    // "Ruim" gráfico de barras
    doc.setFillColor(255, 0, 0); // Vermelho
    doc.rect(barChartX + barWidth + 20, barChartY + (chartMaxHeight - heightRuim), barWidth, heightRuim, "F");
    doc.setTextColor(255, 255, 255); // Texto Branco
    doc.text(`${porcentagemRuim}%`, barChartX + barWidth + 20 + barWidth / 2, barChartY + (chartMaxHeight - heightRuim) + 25, null, null, "center");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Bom", barChartX + barWidth / 2, barChartY + chartMaxHeight + 10, null, null, "center");
    doc.text("Ruim", barChartX + barWidth + 20 + barWidth / 2, barChartY + chartMaxHeight + 10, null, null, "center");

    doc.text("Distribuição de Respostas", 105, barChartY - 10, null, null, "center");

    // Página 2: Detalhamento
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(255, 102, 0);
    doc.text("Detalhamento das Respostas", 105, 20, null, null, "center");

    let yPosition = 40;
    const lineHeight = 10;
    const pageHeight = 280;

    itens.forEach(({ question, answer, observacao }) => {
        doc.setFontSize(12);

        // Cor e exibição do texto
        if (answer === "Bom") {
            doc.setTextColor(0, 128, 0); // Verde
            doc.text(`${question}: ${answer}`, 10, yPosition);
        } else {
            doc.setTextColor(255, 0, 0); // Vermelho
            doc.text(`${question}: ${answer}`, 10, yPosition);

            // Divisória abaixo
            yPosition += lineHeight;
            doc.setDrawColor(200, 200, 200);
            doc.line(10, yPosition, 200, yPosition);

            // Justificativa abaixo da divisória
            yPosition += lineHeight;
            doc.setTextColor(0, 0, 0); // Preto
            doc.text(`Justificativa: ${observacao || "Não informada"}`, 10, yPosition);
        }

        yPosition += lineHeight;

        if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
        }
    });

    const fileName = `Checklist-${data.split(" ")[0].replace(/\//g, "-")}-${nome.replace(/\s/g, "-")}.pdf`;
    doc.save(fileName);
}
