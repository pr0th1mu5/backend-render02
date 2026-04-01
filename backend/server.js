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
    
    // Mapeia o que já foi preenchido: "Data-Turno-Vaga"
    const ocupados = linhas.map(l => {
        const p = l.split(' | ');
        return `${p[4]}-${p[5]}-${p[6]}`; // Ex: "06/04-Manhã-Vaga 1"
    });

    res.json({ ocupados, totalGeral: linhas.length });
});

app.post('/inscrever', (req, res) => {
    const { nome, email, whats, data, turno, vaga } = req.body;
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '');
    
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    // Verifica se aquela vaga específica já foi ocupada (prevenção de clique duplo)
    if (content.includes(`| ${data} | ${turno} | ${vaga} |`)) {
        return res.status(400).json({ message: 'Esta vaga acabou de ser ocupada por outra pessoa!' });
    }

    const novaLinha = `${new Date().toLocaleString()} | ${nome} | ${email} | ${whats} | ${data} | ${turno} | ${vaga}\n`;
    fs.appendFileSync(FILE_PATH, novaLinha);
    res.json({ message: 'Sucesso' });
});

app.listen(3001, () => console.log('Servidor rodando na 3001'));
