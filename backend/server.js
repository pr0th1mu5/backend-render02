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
   
    const nodemailer = require('nodemailer');

// 1. Configure o seu transportador (Use o Gmail como exemplo)
// DICA: Para o Gmail, você precisará gerar uma "Senha de App" nas configurações de segurança da sua conta Google.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'clecioufpi@gmail.com', // Coloque seu e-mail aqui
    pass: 'nchl rnzo ybma owsm'   // Coloque a Senha de App de 16 dígitos aqui
  }
});

app.post('/inscrever', (req, res) => {
    const { nome, email, whats, cpf, data, turno, vaga } = req.body;
    const content = fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, 'utf-8') : '';

    if (content.includes(`| ${cpf} |`)) {
        return res.status(400).json({ message: 'Este CPF já possui reserva!' });
    }

    const novaLinha = `${new Date().toLocaleString()} | ${nome} | ${cpf} | ${email} | ${whats} | ${data} | ${turno} | ${vaga}\n`;

    try {
        // Grava no arquivo (mesmo que seja temporário)
        fs.appendFileSync(FILE_PATH, novaLinha, 'utf-8');
        
        // --- ENVIO DO E-MAIL DE BACKUP ---
        const mailOptions = {
          from: 'clecioufpi@gmail.com',
          to: 'clecioufpi@gmail.com', // Você recebe no seu próprio e-mail
          subject: `Nova Inscrição: ${nome}`,
          text: `Dados da Inscrição:\n\n${novaLinha}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log("Erro ao enviar e-mail:", error);
          else console.log("E-mail de backup enviado: " + info.response);
        });
        // ---------------------------------

        res.json({ message: 'Sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

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