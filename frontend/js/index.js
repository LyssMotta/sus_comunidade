const API = "http://localhost:3000/api";

let unidades = [];
let usuarioAtual = null;


// ==========================================
// USUÁRIO
// ==========================================

async function cadastrarUsuario() {

    const nome = document
        .getElementById("usuarioNome")
        .value
        .trim();

    const email = document
        .getElementById("usuarioEmail")
        .value
        .trim();


    if (!nome || !email) {

        alert("Digite seu nome e email.");

        return;
    }


    try {

        const resposta = await fetch(
            `${API}/usuarios`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: nome,
                    email: email
                })
            }
        );


        const resultado = await resposta.json();


        if (!resposta.ok) {

            /*
             Se o email já existir,
             podemos usar o usuário existente.
            */

            if (
                resposta.status === 409 &&
                resultado.id
            ) {

                usuarioAtual = {
                    id: resultado.id,
                    nome: resultado.nome
                };

                salvarUsuario();

                mostrarUsuario();

                return;
            }


            alert(
                resultado.erro ||
                "Erro ao criar perfil."
            );

            return;
        }


        usuarioAtual = {

            id: resultado.id,

            nome: resultado.nome

        };


        salvarUsuario();

        mostrarUsuario();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

}


// ==========================================
// SALVAR USUÁRIO
// ==========================================

function salvarUsuario() {

    localStorage.setItem(
        "usuarioAtual",
        JSON.stringify(usuarioAtual)
    );

}


// ==========================================
// MOSTRAR USUÁRIO
// ==========================================

function mostrarUsuario() {

    document.getElementById(
        "perfilMensagem"
    ).textContent =
        `Olá, ${usuarioAtual.nome}! Seu perfil está ativo.`;

}


// ==========================================
// RECUPERAR USUÁRIO
// ==========================================

function carregarUsuario() {

    const usuarioSalvo =
        localStorage.getItem("usuarioAtual");


    if (!usuarioSalvo) {

        return;
    }


    try {

        usuarioAtual =
            JSON.parse(usuarioSalvo);

        mostrarUsuario();

    } catch (erro) {

        localStorage.removeItem(
            "usuarioAtual"
        );

    }

}


// ==========================================
// UNIDADES
// ==========================================

async function carregarUnidades() {

    try {

        const resposta = await fetch(
            `${API}/unidades`
        );


        unidades = await resposta.json();


        if (!Array.isArray(unidades)) {

            throw new Error(
                "Resposta inválida do servidor."
            );

        }


        mostrarUnidades(unidades);

        preencherUnidades();


    } catch (erro) {

        console.error(erro);

        document.getElementById(
            "lista"
        ).innerHTML =
            "<p>Não foi possível conectar ao servidor.</p>";

    }

}


// ==========================================
// PREENCHER SELECT DE UNIDADES
// ==========================================

function preencherUnidades() {

    const select =
        document.getElementById(
            "unidadePublicacao"
        );


    select.innerHTML = `
        <option value="">
            Selecione uma unidade
        </option>
    `;


    unidades.forEach(unidade => {

        select.innerHTML += `
            <option value="${unidade.id}">
                ${unidade.nome} - ${unidade.bairro}
            </option>
        `;

    });

}


// ==========================================
// PUBLICAR
// ==========================================

async function publicar() {

    if (!usuarioAtual) {

        alert(
            "Primeiro crie seu perfil."
        );

        return;
    }


    const texto =
        document
            .getElementById("textoPublicacao")
            .value
            .trim();


    const unidadeId =
        document
            .getElementById("unidadePublicacao")
            .value;


    const medicamento =
        document
            .getElementById("medicamentoPublicacao")
            .value;


    const consultas =
        document
            .getElementById("consultasPublicacao")
            .value;


    const movimento =
        document
            .getElementById("movimentoPublicacao")
            .value;


    if (!texto) {

        alert(
            "Escreva o que está acontecendo na unidade."
        );

        return;
    }


    if (!unidadeId) {

        alert(
            "Selecione uma unidade."
        );

        return;
    }


    try {

        const resposta = await fetch(
            `${API}/publicacoes`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    usuario_id:
                        usuarioAtual.id,

                    unidade_id:
                        Number(unidadeId),

                    texto: texto,

                    medicamento:
                        medicamento || null,

                    consultas:
                        consultas || null,

                    movimento:
                        movimento || null

                })
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Erro ao publicar."
            );

            return;
        }


        document.getElementById(
            "textoPublicacao"
        ).value = "";


        document.getElementById(
            "unidadePublicacao"
        ).value = "";


        document.getElementById(
            "medicamentoPublicacao"
        ).value = "";


        document.getElementById(
            "consultasPublicacao"
        ).value = "";


        document.getElementById(
            "movimentoPublicacao"
        ).value = "";


        document.getElementById(
            "publicacaoMensagem"
        ).textContent =
            "Publicação realizada com sucesso!";


        carregarPublicacoes();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

}


// ==========================================
// CARREGAR PUBLICAÇÕES
// ==========================================

async function carregarPublicacoes() {

    try {

        const resposta = await fetch(
            `${API}/publicacoes`
        );


        const publicacoes =
            await resposta.json();


        if (!Array.isArray(publicacoes)) {

            throw new Error(
                "Resposta inválida."
            );

        }


        mostrarPublicacoes(publicacoes);


    } catch (erro) {

        console.error(erro);

        document.getElementById(
            "feed"
        ).innerHTML = `
            <div class="card">
                <p>
                    Não foi possível carregar a comunidade.
                </p>
            </div>
        `;

    }

}


// ==========================================
// MOSTRAR FEED
// ==========================================

function mostrarPublicacoes(publicacoes) {

    const feed =
        document.getElementById("feed");


    if (publicacoes.length === 0) {

        feed.innerHTML = `
            <div class="card">

                <p>
                    Ainda não existem publicações.
                </p>

                <p>
                    Seja o primeiro a compartilhar
                    uma informação!
                </p>

            </div>
        `;

        return;
    }


    feed.innerHTML =
        publicacoes.map(publicacao => `

            <article class="publicacao">

                <div class="publicacao-topo">

                    👤
                    <strong>
                        ${publicacao.usuario}
                    </strong>

                </div>


                <div class="unidade-publicacao">

                    🏥
                    <strong>
                        ${publicacao.unidade}
                    </strong>

                    <br>

                    📍
                    ${publicacao.bairro},
                    ${publicacao.cidade}

                </div>


                <p class="texto-publicacao">

                    ${publicacao.texto}

                </p>


                <div class="informacoes-publicacao">

                    ${
                        publicacao.medicamento
                        ?
                        `💊 Medicamento:
                        <strong>
                            ${publicacao.medicamento}
                        </strong>`
                        :
                        ""
                    }


                    ${
                        publicacao.consultas
                        ?
                        `<br>📅 Consultas:
                        <strong>
                            ${publicacao.consultas}
                        </strong>`
                        :
                        ""
                    }


                    ${
                        publicacao.movimento
                        ?
                        `<br>👥 Movimento:
                        <strong>
                            ${publicacao.movimento}
                        </strong>`
                        :
                        ""
                    }

                </div>


                <div class="acoes-publicacao">

                    <button
                        type="button"
                        onclick="curtir(${publicacao.id})"
                    >
                        ❤️
                        Curtir
                        (${publicacao.curtidas || 0})
                    </button>


                    <button
                        type="button"
                        onclick="mostrarComentarios(${publicacao.id})"
                    >
                        💬
                        Comentar
                        (${publicacao.quantidade_comentarios || 0})
                    </button>

                </div>


                <div
                    id="comentarios-${publicacao.id}"
                    class="area-comentarios"
                ></div>

            </article>

        `).join("");

}


// ==========================================
// CURTIR
// ==========================================

async function curtir(publicacaoId) {

    if (!usuarioAtual) {

        alert(
            "Crie seu perfil para curtir publicações."
        );

        return;
    }


    try {

        const resposta = await fetch(
            `${API}/publicacoes/${publicacaoId}/curtir`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    usuario_id:
                        usuarioAtual.id

                })
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Erro ao curtir."
            );

            return;
        }


        carregarPublicacoes();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

}


// ==========================================
// MOSTRAR COMENTÁRIOS
// ==========================================

async function mostrarComentarios(publicacaoId) {

    const area =
        document.getElementById(
            `comentarios-${publicacaoId}`
        );


    if (!area) {

        return;
    }


    try {

        const resposta = await fetch(
            `${API}/publicacoes/${publicacaoId}/comentarios`
        );


        const comentarios =
            await resposta.json();


        let html = "";


        if (comentarios.length === 0) {

            html += `
                <p>
                    Ainda não existem comentários.
                </p>
            `;

        } else {

            comentarios.forEach(comentario => {

                html += `
                    <div class="comentario">

                        <strong>
                            👤 ${comentario.usuario}
                        </strong>

                        <p>
                            ${comentario.texto}
                        </p>

                    </div>
                `;

            });

        }


        if (usuarioAtual) {

            html += `

                <div class="novo-comentario">

                    <input
                        id="comentario-${publicacaoId}"
                        type="text"
                        placeholder="Escreva um comentário..."
                    >

                    <button
                        type="button"
                        onclick="comentar(${publicacaoId})"
                    >
                        Enviar comentário
                    </button>

                </div>

            `;

        } else {

            html += `
                <p>
                    Crie seu perfil para comentar.
                </p>
            `;

        }


        area.innerHTML = html;


    } catch (erro) {

        console.error(erro);

        area.innerHTML =
            "<p>Erro ao carregar comentários.</p>";

    }

}


// ==========================================
// COMENTAR
// ==========================================

async function comentar(publicacaoId) {

    if (!usuarioAtual) {

        alert(
            "Crie seu perfil para comentar."
        );

        return;
    }


    const campo =
        document.getElementById(
            `comentario-${publicacaoId}`
        );


    const texto =
        campo.value.trim();


    if (!texto) {

        alert(
            "Digite um comentário."
        );

        return;
    }


    try {

        const resposta = await fetch(
            `${API}/publicacoes/${publicacaoId}/comentarios`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    usuario_id:
                        usuarioAtual.id,

                    texto: texto

                })
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Erro ao comentar."
            );

            return;
        }


        mostrarComentarios(
            publicacaoId
        );

        carregarPublicacoes();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

}


// ==========================================
// MOSTRAR UNIDADES
// ==========================================

function mostrarUnidades(dados) {

    const lista =
        document.getElementById("lista");


    if (!dados.length) {

        lista.innerHTML =
            "<p>Nenhuma unidade encontrada.</p>";

        return;
    }


    lista.innerHTML =
        dados.map(u => `

            <article class="unidade">

                <h3>
                    🏥 ${u.nome}
                </h3>

                <div class="info">

                    🏥 Tipo:
                    <strong>
                        ${u.tipo}
                    </strong>

                    <br>

                    📍 Cidade:
                    <strong>
                        ${u.cidade}
                    </strong>

                    <br>

                    📍 Bairro:
                    <strong>
                        ${u.bairro}
                    </strong>

                    <br>

                    🏠 Endereço:
                    <strong>
                        ${u.endereco}, ${u.numero}
                    </strong>

                    <br>

                    📮 CEP:
                    <strong>
                        ${u.cep}
                    </strong>

                    <br>

                    💊 Medicamento:
                    <strong>
                        ${u.medicamentos}
                    </strong>

                    <br>

                    💊 Outros medicamentos:
                    <strong>
                        ${u.outros_medicamentos ||
                        "Nenhum informado"}
                    </strong>

                    <br>

                    📅 Consultas:
                    <strong>
                        ${u.consultas}
                    </strong>

                    <br>

                    👥 Movimento:
                    <strong>
                        ${u.movimento}
                    </strong>

                    <br>

                    🕐 24 horas:
                    <strong>
                        ${u.atende_24h ? "Sim" : "Não"}
                    </strong>

                </div>

            </article>

        `).join("");

}


// ==========================================
// PESQUISAR
// ==========================================

function buscar() {

    const termo =
        document
            .getElementById("busca")
            .value
            .toLowerCase()
            .trim();


    const resultado =
        unidades.filter(u =>

            u.nome
                .toLowerCase()
                .includes(termo)

            ||

            u.bairro
                .toLowerCase()
                .includes(termo)

            ||

            u.cidade
                .toLowerCase()
                .includes(termo)

        );


    mostrarUnidades(resultado);

}


// ==========================================
// CADASTRAR UNIDADE
// ==========================================

const formUnidade =
    document.getElementById(
        "formUnidade"
    );


if (formUnidade) {

    formUnidade.addEventListener(
        "submit",
        cadastrarUnidade
    );

}


async function cadastrarUnidade(event) {

    event.preventDefault();


    const unidade = {

        nome:
            document.getElementById(
                "nome"
            ).value.trim(),

        tipo:
            document.getElementById(
                "tipo"
            ).value,

        bairro:
            document.getElementById(
                "bairro"
            ).value.trim(),

        cidade:
            document.getElementById(
                "cidade"
            ).value.trim(),

        endereco:
            document.getElementById(
                "endereco"
            ).value.trim(),

        numero:
            document.getElementById(
                "numero"
            ).value.trim(),

        cep:
            document.getElementById(
                "cep"
            ).value.trim(),

        medicamentos:
            document.getElementById(
                "medicamentos"
            ).value,

        outrosMedicamentos:
            document.getElementById(
                "outrosMedicamentos"
            ).value.trim(),

        consultas:
            document.getElementById(
                "consultas"
            ).value,

        movimento:
            document.getElementById(
                "movimento"
            ).value,

        atende_24h:
            Number(
                document.getElementById(
                    "atende_24h"
                ).value
            )

    };


    try {

        const resposta = await fetch(
            `${API}/unidades`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(unidade)
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Erro ao cadastrar unidade."
            );

            return;
        }


        alert(
            "Unidade cadastrada com sucesso!"
        );


        document
            .getElementById(
                "formUnidade"
            )
            .reset();


        carregarUnidades();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

}


// ==========================================
// INICIAR
// ==========================================

carregarUsuario();

carregarUnidades();

carregarPublicacoes();