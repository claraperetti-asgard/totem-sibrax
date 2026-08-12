const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        mensagem: "Backend Totem Sorteio funcionando!",
    });
});

// campo desligado no painel admin chega vazio/ausente e vai como null
const ouNulo = (valor) =>
    valor === undefined || valor === null || valor === "" ? null : valor;

app.post("/respostas", (req, res) => {
    const {
        nome,
        email,
        cpf,
        telefone,
        razao_social,
        e_cliente,
    } = req.body;

   
    const cpfDigitos = String(cpf ?? "").replace(/\D/g, "");

    if (cpfDigitos.length !== 11) {
        return res.status(400).json({
            mensagem: "CPF obrigatório e deve ter 11 dígitos.",
        });
    }

    try {
        const jaParticipou = db
            .prepare("SELECT id FROM respostas WHERE cpf = ?")
            .get(cpfDigitos);

        if (jaParticipou) {
            return res.status(409).json({
                mensagem: "Este CPF já participou.",
            });
        }

        const stmt = db.prepare(`
            INSERT INTO respostas (
                nome,
                email,
                cpf,
                telefone,
                razao_social,
                e_cliente
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            ouNulo(nome),
            ouNulo(email),
            cpfDigitos,
            ouNulo(telefone),
            ouNulo(razao_social),
            e_cliente === undefined || e_cliente === null
                ? null
                : Number(e_cliente)
        );

        res.status(201).json({
            mensagem: "Resposta salva com sucesso!",
            id: result.lastInsertRowid,
        });
    } catch (error) {
        // corrida entre dois cadastros simultâneos com o mesmo CPF
        if (error && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                mensagem: "Este CPF já participou.",
            });
        }

        console.error("Erro ao salvar resposta:", error);

        res.status(500).json({
            mensagem: "Erro ao salvar resposta.",
        });
    }
});

app.get("/respostas", (req, res) => {
    try {
        const respostas = db
            .prepare(`
                SELECT *
                FROM respostas
                ORDER BY id DESC
            `)
            .all();

        res.json(respostas);
    } catch (error) {
        console.error("Erro ao buscar respostas:", error);

        res.status(500).json({
            mensagem: "Erro ao buscar respostas.",
        });
    }
});


app.get("/sorteio", (req, res) => {
    try {
        const vencedor = db
            .prepare(`
                SELECT *
                FROM respostas
                ORDER BY RANDOM()
                LIMIT 1
            `)
            .get();

        if (!vencedor) {
            return res.status(404).json({
                mensagem: "Nenhum participante cadastrado.",
            });
        }

        res.json({
            mensagem: "Participante sorteado com sucesso!",
            vencedor,
        });
    } catch (error) {
        console.error("Erro ao realizar sorteio:", error);

        res.status(500).json({
            mensagem: "Erro ao realizar sorteio.",
        });
    }
});


app.get("/respostas/exportar", (req, res) => {
    try {
        const respostas = db
            .prepare(`
                SELECT
                    id,
                    nome,
                    email,
                    cpf,
                    telefone,
                    razao_social,
                    e_cliente,
                    criado_em
                FROM respostas
                ORDER BY id ASC
            `)
            .all();

        if (respostas.length === 0) {
            return res.status(404).json({
                mensagem: "Nenhuma resposta cadastrada para exportar.",
            });
        }

        // Converte 1/0 para SIM/NÃO no Excel
        const dadosExcel = respostas.map((resposta) => ({
            ID: resposta.id,
            Nome: resposta.nome,
            Email: resposta.email,
            CPF: resposta.cpf,
            Telefone: resposta.telefone,
            "Razão Social": resposta.razao_social,
            "É cliente?":
                resposta.e_cliente === 1
                    ? "SIM"
                    : resposta.e_cliente === 0
                        ? "NÃO"
                        : "",
            "Data de cadastro": resposta.criado_em,
        }));

        // Cria a planilha
        const worksheet = XLSX.utils.json_to_sheet(dadosExcel);

        // Cria o arquivo Excel
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Participantes"
        );

        // Gera o arquivo XLSX em memória
        const arquivo = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        // Define o download
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="participantes.xlsx"'
        );

        res.send(arquivo);
    } catch (error) {
        console.error("Erro ao exportar respostas:", error);

        res.status(500).json({
            mensagem: "Erro ao exportar respostas.",
        });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});