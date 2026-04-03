const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const FILE_PATH = './inscricoes.txt';

app.get('/status', (req, res) => {
    if (!fs.existsSync(FILE_PATH)) return res.json({ ocupados: [], totalGeral: 0 });
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    const linhas = content.split('\n').filter(l => l.trim() !== '');
    const ocupados = linhas.map(l => {
        const p = l.split(' | ');
        return `${p[5]}-${p[6]}-${p[7]}`; // Data-Turno-Vaga
    });
    res.json({ ocupados, totalGeral: linhas.length });
});

app.post('/inscrever', (req, res) => {
    const { nome, email, whats, cpf, data, turno, vaga } = req.body;
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '');
    const content = fs.readFileSync(FILE_PATH, 'utf-8');

    if (content.includes(`| ${data} | ${turno} | ${vaga} |`)) {
        return res.status(400).json({ message: 'Esta vaga acabou de ser ocupada!' });
    }

    if (!cpf || cpf.length !== 14) {
        return res.status(400).json({ message: 'CPF inválido. Use o formato 000.000.000-00' });
    }

    const novaLinha = `${new Date().toLocaleString()} | ${nome} | ${cpf} | ${email} | ${whats} | ${data} | ${turno} | ${vaga}\n`;
    fs.appendFileSync(FILE_PATH, novaLinha);
    res.json({ message: 'Sucesso' });
});

app.get('/lista-60-vagas-secreta', (req, res) => {
    if (fs.existsSync(FILE_PATH)) {
        const conteudo = fs.readFileSync(FILE_PATH, 'utf-8');
        res.send(`<html><body style="font-family:monospace;padding:20px;"><h2>Inscritos</h2><pre>${conteudo}</pre></body></html>`);
    } else { res.send("Arquivo não encontrado."); }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Rodando na porta ${port}`));