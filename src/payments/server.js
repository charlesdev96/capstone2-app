const {createService}=require("../shared/observability");
const {app,logger}=createService("payments");
app.post("/payments",(req,res)=>{const {order_id,amount}=req.body||{}; if(!order_id||typeof amount!=="number"||amount<=0)return res.status(400).json({error:"order_id and positive numeric amount are required"}); return res.status(201).json({payment_id:`pay-${Date.now()}`,order_id,amount,status:"accepted"});});
const port=Number(process.env.PORT||3004); app.listen(port,()=>logger.info({port},"payments service listening"));
