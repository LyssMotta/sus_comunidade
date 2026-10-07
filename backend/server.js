const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// ==========================================
// UNIDADES
// ==========================================

app.get("/api/unidades", async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT
                u.*,
                i.medicamentos,
                i.outros_medicamentos,
                i.consultas,
                i.movimento
            FROM unidades u
            LEFT JOIN informacoes i
                ON i.unidade_id = u.id
            ORDER BY u.nome
        `);

        res.json(rows);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar unidades"
        });

    }

});


app.post("/api/unidades", async (req, res) => {

    try {

        const {
            nome,
            tipo,
            bairro,
            cidade,
            endereco,
            numero,
            cep,
            atende_24h,
            medicamentos,
            outrosMedicamentos,
            consultas,
            movimento
        } = req.body;


        const [existente] = await pool.query(
            `
            SELECT id
            FROM unidades
            WHERE nome = ?
            AND endereco = ?
            AND numero = ?
            `,
            [nome, endereco, numero]
        );


        if (existente.length > 0) {

            return res.status(409).json({
                erro: "Esta unidade já está cadastrada."
            });

        }


        const [resultado] = await pool.query(
            `
            INSERT INTO unidades
            (
                nome,
                tipo,
                endereco,
                numero,
                cep,
                bairro,
                cidade,
                atende_24h
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                nome,
                tipo,
                endereco,
                numero,
                cep,
                bairro,
                cidade,
                atende_24h
            ]
        );


        const unidadeId = resultado.insertId;


        await pool.query(
            `
            INSERT INTO informacoes
            (
                unidade_id,
                medicamentos,
                outros_medicamentos,
                consultas,
                movimento
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                unidadeId,
                medicamentos,
                outrosMedicamentos,
                consultas,
                movimento
            ]
        );


        res.status(201).json({
            mensagem: "Unidade cadastrada com sucesso!",
            id: unidadeId
        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar unidade"
        });

    }

});



// ==========================================
// USUÁRIOS
// ==========================================

app.post("/api/usuarios", async (req, res) => {

    try {

        const {
            nome,
            email
        } = req.body;


        if (!nome || !email) {

            return res.status(400).json({
                erro: "Nome e email são obrigatórios."
            });

        }


        const [existente] = await pool.query(
            `
            SELECT id, nome
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );


        if (existente.length > 0) {

            return res.status(409).json({
                erro: "Este email já está cadastrado.",
                id: existente[0].id,
                nome: existente[0].nome
            });

        }


        const [resultado] = await pool.query(
            `
            INSERT INTO usuarios
            (
                nome,
                email
            )
            VALUES (?, ?)
            `,
            [
                nome,
                email
            ]
        );


        res.status(201).json({

            mensagem: "Usuário cadastrado com sucesso!",

            id: resultado.insertId,

            nome: nome

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar usuário"
        });

    }

});



// ==========================================
// PUBLICAÇÕES
// ==========================================

app.get("/api/publicacoes", async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT
                p.id,
                p.texto,
                p.medicamento,
                p.consultas,
                p.movimento,
                p.data_publicacao,

                u.id AS usuario_id,
                u.nome AS usuario,

                un.id AS unidade_id,
                un.nome AS unidade,
                un.tipo,
                un.bairro,
                un.cidade,

                (
                    SELECT COUNT(*)
                    FROM curtidas c
                    WHERE c.publicacao_id = p.id
                ) AS curtidas,

                (
                    SELECT COUNT(*)
                    FROM comentarios cm
                    WHERE cm.publicacao_id = p.id
                ) AS quantidade_comentarios

            FROM publicacoes p

            INNER JOIN usuarios u
                ON u.id = p.usuario_id

            INNER JOIN unidades un
                ON un.id = p.unidade_id

            ORDER BY p.data_publicacao DESC
        `);


        res.json(rows);


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar publicações"
        });

    }

});


app.post("/api/publicacoes", async (req, res) => {

    try {

        const {
            usuario_id,
            unidade_id,
            texto,
            medicamento,
            consultas,
            movimento
        } = req.body;


        if (
            !usuario_id ||
            !unidade_id ||
            !texto
        ) {

            return res.status(400).json({
                erro: "Usuário, unidade e texto são obrigatórios."
            });

        }


        const [resultado] = await pool.query(
            `
            INSERT INTO publicacoes
            (
                usuario_id,
                unidade_id,
                texto,
                medicamento,
                consultas,
                movimento
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                usuario_id,
                unidade_id,
                texto,
                medicamento || null,
                consultas || null,
                movimento || null
            ]
        );


        res.status(201).json({

            mensagem: "Publicação criada com sucesso!",

            id: resultado.insertId

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao criar publicação"
        });

    }

});



// ==========================================
// CURTIR PUBLICAÇÃO
// ==========================================

app.post("/api/publicacoes/:id/curtir", async (req, res) => {

    try {

        const publicacaoId = req.params.id;

        const {
            usuario_id
        } = req.body;


        if (!usuario_id) {

            return res.status(400).json({
                erro: "Usuário não informado."
            });

        }


        const [curtida] = await pool.query(
            `
            SELECT id
            FROM curtidas
            WHERE usuario_id = ?
            AND publicacao_id = ?
            `,
            [
                usuario_id,
                publicacaoId
            ]
        );


        if (curtida.length > 0) {

            await pool.query(
                `
                DELETE FROM curtidas
                WHERE usuario_id = ?
                AND publicacao_id = ?
                `,
                [
                    usuario_id,
                    publicacaoId
                ]
            );


            return res.json({
                mensagem: "Curtida removida.",
                curtiu: false
            });

        }


        await pool.query(
            `
            INSERT INTO curtidas
            (
                usuario_id,
                publicacao_id
            )
            VALUES (?, ?)
            `,
            [
                usuario_id,
                publicacaoId
            ]
        );


        res.json({
            mensagem: "Publicação curtida!",
            curtiu: true
        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao curtir publicação"
        });

    }

});



// ==========================================
// COMENTÁRIOS
// ==========================================

app.get("/api/publicacoes/:id/comentarios", async (req, res) => {

    try {

        const publicacaoId = req.params.id;


        const [rows] = await pool.query(`
            SELECT
                c.id,
                c.texto,
                c.data_comentario,
                u.nome AS usuario

            FROM comentarios c

            INNER JOIN usuarios u
                ON u.id = c.usuario_id

            WHERE c.publicacao_id = ?

            ORDER BY c.data_comentario ASC
        `, [publicacaoId]);


        res.json(rows);


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar comentários"
        });

    }

});


app.post("/api/publicacoes/:id/comentarios", async (req, res) => {

    try {

        const publicacaoId = req.params.id;

        const {
            usuario_id,
            texto
        } = req.body;


        if (!usuario_id || !texto) {

            return res.status(400).json({
                erro: "Usuário e comentário são obrigatórios."
            });

        }


        await pool.query(
            `
            INSERT INTO comentarios
            (
                usuario_id,
                publicacao_id,
                texto
            )
            VALUES (?, ?, ?)
            `,
            [
                usuario_id,
                publicacaoId,
                texto
            ]
        );


        res.status(201).json({

            mensagem: "Comentário publicado!"

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao publicar comentário"
        });

    }

});



// ==========================================
// SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Servidor funcionando: http://localhost:${PORT}`
    );

});