const request=require("supertest");
const {createService}=require("../src/shared/observability");
describe("shared observability",()=>{
 test("health endpoint",async()=>{const {app}=createService("test");const r=await request(app).get("/health");expect(r.status).toBe(200);expect(r.body).toEqual({status:"ok",service:"test"});});
 test("trace id propagation",async()=>{const {app}=createService("test");app.get("/echo",(req,res)=>res.json({trace_id:req.traceId}));const r=await request(app).get("/echo").set("x-trace-id","capstone-123");expect(r.headers["x-trace-id"]).toBe("capstone-123");expect(r.body.trace_id).toBe("capstone-123");});
 test("prometheus metrics endpoint",async()=>{const {app}=createService("test");const r=await request(app).get("/metrics");expect(r.status).toBe(200);expect(r.text).toContain("http_requests_total");});
});
