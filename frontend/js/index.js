const API="http://localhost:3000/api/unidades";
let unidades=[];
async function carregarUnidades(){
 const lista=document.getElementById("lista");
 try{
  const resposta=await fetch(API);
  unidades=await resposta.json();
  mostrar(unidades);
 }catch(erro){
  lista.innerHTML="<p>Não foi possível conectar ao servidor. Inicie o backend.</p>";
  console.error(erro);
 }
}
function mostrar(dados){
 const lista=document.getElementById("lista");
 if(dados.length===0){lista.innerHTML="<p>Nenhuma unidade encontrada.</p>";return;}
 lista.innerHTML=dados.map(u=>`
 <article class="unidade">
 <h3>🏥 ${u.nome}</h3>
 <div class="info">
 📍 ${u.bairro}<br>
 🏠 ${u.endereco}<br>
 💊 Medicamentos: <strong>${u.medicamentos}</strong><br>
 📅 Consultas: <strong>${u.consultas}</strong><br>
 👥 Movimento: <strong>${u.movimento}</strong><br>
 🕐 24 horas: <strong>${u.atende_24h?"Sim":"Não"}</strong>
 </div>
 </article>`).join("");
}
function buscar(){
 const termo=document.getElementById("busca").value.toLowerCase().trim();
 mostrar(unidades.filter(u=>u.nome.toLowerCase().includes(termo)||u.bairro.toLowerCase().includes(termo)));
}
carregarUnidades();