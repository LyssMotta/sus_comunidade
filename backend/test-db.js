const pool = require("./db");

async function testarBanco() {
    try {
        const [resultado] = await pool.query("SELECT * FROM unidades");

        console.log("Conexão com o banco funcionando!");
        console.log(resultado);
    } catch (erro) {
        console.error("Erro ao conectar ao banco:");
        console.error(erro);
    }
}

testarBanco();