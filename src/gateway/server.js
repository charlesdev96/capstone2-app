const {createService}=require("../shared/observability");
const {app,logger}=createService("gateway");
const usersUrl=process.env.USERS_URL||"http://localhost:3002";
const ordersUrl=process.env.ORDERS_URL||"http://localhost:3003";
app.get("/",(_req,res)=>res.json({service:"gateway",message:"GitOps Shop API"}));
app.get("/api/users",async(req,res)=>{try{const r=await fetch(`${usersUrl}/users`,{headers:{"x-trace-id":req.traceId}});return res.status(r.status).json(await r.json());}catch(error){logger.error({trace_id:req.traceId,err:error.message},"users service unavailable");return res.status(503).json({error:"Users service unavailable",trace_id:req.traceId});}});
app.post("/api/orders",async(req,res)=>{try{const r=await fetch(`${ordersUrl}/orders`,{method:"POST",headers:{"content-type":"application/json","x-trace-id":req.traceId},body:JSON.stringify(req.body)});return res.status(r.status).json(await r.json());}catch(error){logger.error({trace_id:req.traceId,err:error.message},"orders service unavailable");return res.status(503).json({error:"Orders service unavailable",trace_id:req.traceId});}});
const port=Number(process.env.PORT||3001); app.listen(port,()=>logger.info({port},"gateway service listening"));
