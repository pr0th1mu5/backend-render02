const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // Adicionado para garantir o caminho correto
const app = express();

app.use(cors());
app.use(express.json());

// Substitua a linha antiga por esta:
const FILE_PATH = path.join(__dirname, 'inscricoes.txt');

// Criar o arquivo se não existir ao ligar o servidor
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, '', 'utf-8');
    console.log("Arquivo físico criado em:", FILE_PATH);
}

app.get('/status', (req, res) => {
    if (!fs.existsSync(FILE_PATH)) return res.json({ ocupados: [], totalGeral: 0 });
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    const linhas = content.split('\n').filter(l => l.trim() !== '');
    const ocupados = linhas.map(l => {
        const p = l.split(' | ');
        return `${p[5]}-${p[6]}-${p[7]}`; 
    });
    res.json({ ocupados, totalGeral: linhas.length });
});

app.post('/inscrever', (req, res) => {
    const { nome, email, whats, cpf, data, turno, vaga } = req.body;
    
    // Lemos o conteúdo atualizado AGORA para validar
    const content = fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, 'utf-8') : '';

    // 1. VALIDAÇÃO DE CPF ÚNICO
    if (content.includes(`| ${cpf} |`)) {
        return res.status(400).json({ message: 'Este CPF já possui uma reserva ativa!' });
    }

    // 2. VALIDAÇÃO DE VAGA ESPECÍFICA
    if (content.includes(`| ${data} | ${turno} | ${vaga}`)) {
        return res.status(400).json({ message: 'Esta vaga acabou de ser ocupada!' });
    }

    // 3. VALIDAÇÃO DE FORMATO
    if (!cpf || cpf.length !== 14) {
        return res.status(400).json({ message: 'CPF inválido.' });
    }

    // Gravação dos dados - GARANTINDO O FORMATO TEXTO (utf-8)
    const novaLinha = `${new Date().toLocaleString()} | ${nome} | ${cpf} | ${email} | ${whats} | ${data} | ${turno} | ${vaga}\n`;
    
    try {
        // Substitua a linha do fs.appendFileSync por esta:
fs.appendFile(FILE_PATH, novaLinha, 'utf8', (err) => {
    if (err) console.log("ERRO REAL AO GRAVAR:", err);
    else console.log("GRAVADO NO DISCO!");
});
        console.log("Salvo com sucesso no arquivo!");
        res.json({ message: 'Sucesso' });
    } catch (err) {
        console.error("Erro ao gravar no arquivo:", err);
        res.status(500).json({ message: 'Erro ao salvar no servidor.' });
    }
});

// ROTA DE BACKUP
app.get('/lista-60-vagas-secreta', (req, res) => {
    if (fs.existsSync(FILE_PATH)) {
        const conteudo = fs.readFileSync(FILE_PATH, 'utf-8');
        res.send(`<html><body style="font-family:monospace;padding:20px;"><h2>Inscritos</h2><pre>${conteudo || "Arquivo ainda sem registros."}</pre></body></html>`);
    } else { res.send("Arquivo não encontrado."); }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));