const Database = require("better-sqlite3");

const db = new Database("./data/respostas.db");

db.pragma("journal_mode = WAL");


const COLUNAS = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    razao_social TEXT,
    e_cliente INTEGER,
    sistema_atual TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
`;

/**
 * Colunas acrescentadas depois que o totem já estava rodando. São
 * adicionadas com ALTER TABLE, que no SQLite não mexe nos dados
 * existentes — mais seguro que recriar a tabela.
 */
const COLUNAS_OPCIONAIS = [
    // qual sistema a pessoa usa hoje; só perguntado a quem não é cliente
    { nome: "sistema_atual", tipo: "TEXT" },
];

const tabelaExiste = () =>
    Boolean(
        db
            .prepare(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'respostas'"
            )
            .get()
    );


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

/** acrescenta colunas novas em bancos que já existiam */
const garantirColunas = () => {
    const existentes = db
        .prepare("PRAGMA table_info(respostas)")
        .all()
        .map((c) => c.name);

    for (const coluna of COLUNAS_OPCIONAIS) {
        if (existentes.includes(coluna.nome)) continue;

        db.exec(`ALTER TABLE respostas ADD COLUMN ${coluna.nome} ${coluna.tipo}`);
        console.log(`Coluna '${coluna.nome}' adicionada à tabela 'respostas'.`);
    }
};

if (!tabelaExiste()) {
    db.exec(`CREATE TABLE respostas (${COLUNAS})`);
} else if (precisaMigrar()) {
    migrar();
}

garantirColunas();

console.log("Banco SQLite conectado!");

module.exports = db;
