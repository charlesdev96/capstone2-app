const {createService}=require("../shared/observability");
const {app,logger}=createService("users");
const users=[{id:"u-1001",name:"Ada Lovelace"},{id:"u-1002",name:"Grace Hopper"}];
app.get("/users",(_req,res)=>res.json(users));
app.get("/users/:id",(req,res)=>{const user=users.find(x=>x.id===req.params.id); if(!user)return res.status(404).json({error:"User not found"}); return res.json(user);});
const port=Number(process.env.PORT||3002); app.listen(port,()=>logger.info({port},"users service listening"));
