const crypto = require("crypto");
const express = require("express");
const pino = require("pino");
const client = require("prom-client");
const logger = pino({ level: process.env.LOG_LEVEL || "info", base: { service: process.env.SERVICE_NAME || "unknown" }, timestamp: pino.stdTimeFunctions.isoTime });
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
const requests = new client.Counter({ name: "http_requests_total", help: "Total HTTP requests", labelNames: ["service","method","route","status_code"], registers: [registry] });
const latency = new client.Histogram({ name: "http_request_duration_seconds", help: "HTTP request duration in seconds", labelNames: ["service","method","route","status_code"], buckets: [0.01,0.025,0.05,0.1,0.25,0.5,1,2,5], registers: [registry] });
function createService(name) {
  const app = express(); app.use(express.json());
  app.use((req,res,next) => {
    const incoming=req.get("x-trace-id");
    req.traceId=incoming && /^[a-zA-Z0-9._-]{1,80}$/.test(incoming) ? incoming : crypto.randomUUID();
    res.setHeader("x-trace-id",req.traceId);
    const end=latency.startTimer();
    res.on("finish",()=>{
      const route=req.route?.path ? `${req.baseUrl||""}${req.route.path}` : req.path;
      if(req.path!=="/health" && req.path!=="/metrics") {
        const labels={service:name,method:req.method,route,status_code:String(res.statusCode)};
        requests.inc(labels); end(labels);
      }
      logger.info({trace_id:req.traceId,method:req.method,path:req.path,status_code:res.statusCode},"http request completed");
    }); next();
  });
  app.get("/health",(_req,res)=>res.json({status:"ok",service:name}));
  app.get("/metrics",async(_req,res)=>{res.set("Content-Type",registry.contentType);res.end(await registry.metrics());});
  return {app,logger};
}
module.exports={createService};
