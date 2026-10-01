const express=require("express");
const cors=require("cors");
const pool=require("./db");
const app=express();
const PORT=3000;
app.use(cors());
app.use(express.json());

app.get("/api/unidades",async(req,res)=>{
 try{
  const [rows]=await pool.query(`
   SELECT u.*,i.medicamentos,i.consultas,i.movimento
   FROM unidades u
   LEFT JOIN informacoes i ON i.unidade_id=u.id
  `);
  res.json(rows);
 }catch(erro){
  console.error(erro);
  res.status(500).json({erro:"Erro ao buscar unidades"});
 }
});
app.listen(PORT,()=>console.log(`Servidor funcionando: http://localhost:${PORT}`));