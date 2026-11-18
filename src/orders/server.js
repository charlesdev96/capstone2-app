const {createService}=require("../shared/observability");
const {app,logger}=createService("orders");
const paymentsUrl=process.env.PAYMENTS_URL||"http://localhost:3004";
app.post("/orders",async(req,res)=>{
 const {user_id,item,amount}=req.body||{};
 if(!user_id||!item||typeof amount!=="number"||amount<=0)return res.status(400).json({error:"user_id, item and positive numeric amount are required"});
 const orderId=`ord-${Date.now()}`;
 try {
  const response=await fetch(`${paymentsUrl}/payments`,{method:"POST",headers:{"content-type":"application/json","x-trace-id":req.traceId},body:JSON.stringify({order_id:orderId,amount})});
  const payment=await response.json();
  if(!response.ok)return res.status(502).json({error:"Payment request failed",details:payment});
  return res.status(201).json({order_id:orderId,user_id,item,amount,status:"created",payment});
 } catch(error) {logger.error({trace_id:req.traceId,err:error.message},"payment service unavailable"); return res.status(503).json({error:"Payment service unavailable",trace_id:req.traceId});}
});
const port=Number(process.env.PORT||3003); app.listen(port,()=>logger.info({port},"orders service listening"));
