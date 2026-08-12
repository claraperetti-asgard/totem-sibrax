const Database = require("better-sqlite3");

const db = new Database("./data/respostas.db");

db.pragma("journal_mode = WAL");

/**
 * Esquema atual.
 *
 * O CPF é o único campo obrigatório e é UNIQUE — é ele que garante
 * "um giro por pessoa". Todos os outros são opcionais, porque o admin
 * pode desligá-los no painel e aí eles chegam aqui como null.
 */
const COLUNAS = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    razao_social TEXT,
    e_cliente INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
`;

const tabelaExiste = () =>
    Boolean(
        db
            .prepare(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'respostas'"
            )
            .get()
    );

/**
 * O esquema antigo tinha `nome NOT NULL` e nenhuma restrição no cpf.
 * O SQLite não permite alterar coluna, então a migração recria a tabela.
 */
const precisaMigrar = () => {
    const colunas = db.prepare("PRAGMA table_info(respostas)").all();

    const cpf = colunas.find((c) => c.name === "cpf");
    const nome = colunas.find((c) => c.name === "nome");

    if (!cpf || !nome) return true;

    return cpf.notnull !== 1 || nome.notnull !== 0;
};

const migrar = () => {
    console.log("Migrando tabela 'respostas' para o esquema novo...");

    const antes = db.prepare("SELECT COUNT(*) AS total FROM respostas").get().total;

    const executar = db.transaction(() => {
        db.exec(`CREATE TABLE respostas_novo (${COLUNAS})`);

        // linhas sem cpf não cabem no esquema novo; entre cpfs repetidos
        // fica o cadastro mais antigo
        db.exec(`
            INSERT INTO respostas_novo
                (id, nome, email, cpf, telefone, razao_social, e_cliente, criado_em)
            SELECT id, nome, email, cpf, telefone, razao_social, e_cliente, criado_em
            FROM respostas
            WHERE cpf IS NOT NULL
              AND TRIM(cpf) <> ''
              AND id IN (
                  SELECT MIN(id)
                  FROM respostas
                  WHERE cpf IS NOT NULL AND TRIM(cpf) <> ''
                  GROUP BY cpf
              )
        `);

        db.exec("DROP TABLE respostas");
        db.exec("ALTER TABLE respostas_novo RENAME TO respostas");
    });

    executar();

    const depois = db.prepare("SELECT COUNT(*) AS total FROM respostas").get().total;

    if (antes !== depois) {
        console.warn(
            `Migração descartou ${antes - depois} registro(s) sem CPF ou com CPF repetido.`
        );
    }

    console.log("Migração concluída.");
};

if (!tabelaExiste()) {
    db.exec(`CREATE TABLE respostas (${COLUNAS})`);
} else if (precisaMigrar()) {
    migrar();
}

console.log("Banco SQLite conectado!");

module.exports = db;
