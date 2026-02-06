"use strict";(()=>{var e={};e.id=682,e.ids=[682],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6005:e=>{e.exports=require("node:crypto")},9615:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>h});var r={};o.r(r),o.d(r,{POST:()=>u});var s=o(9303),a=o(8716),i=o(670),n=o(7070),p=o(1970);let l=process.env.DOMAIN||"qosmos.one",d=process.env.REPORT_EMAIL||"contact@qosmos.one";async function c(e,t,o){if(process.env.RESEND_API_KEY)try{return(await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.RESEND_API_KEY}`},body:JSON.stringify({from:`Qosmos <newsletter@${l}>`,to:[e],subject:t,html:o})})).ok}catch(e){return console.error("Resend error:",e),!1}return console.log("========================================"),console.log(`📧 EMAIL REPORT (would be sent to: ${e})`),console.log("========================================"),console.log(`Subject: ${t}`),console.log(o),console.log("========================================"),!0}async function u(){try{let e=new Date().toISOString().split("T")[0];new Date(Date.now()-864e5).toISOString().split("T")[0];let t=await p.kv.smembers("subscribers:emails")||[],o=await p.kv.smembers(`subscribers:today:${e}`)||[],r=t.length,s=o.length,a=[];for(let e of o){let t=await p.kv.hgetall(`subscriber:${e}`);t&&a.push(t)}let i=`📊 Qosmos Daily Report - ${e}`,u=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 24px;">📊 Qosmos Daily Report</h1>
    <p style="color: #666; margin: 0 0 24px 0;">${e}</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div style="background: #f0f7ff; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #5B7FFF;">${r}</div>
        <div style="color: #666; font-size: 14px;">Total Subscribers</div>
      </div>
      <div style="background: #f0fff4; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #22c55e;">${s}</div>
        <div style="color: #666; font-size: 14px;">New Today</div>
      </div>
    </div>
    
    ${a.length>0?`
    <h2 style="font-size: 16px; color: #1a1a2e; margin: 24px 0 12px 0;">🆕 New Subscribers Today</h2>
    <ul style="margin: 0; padding: 0 0 0 20px; color: #444; line-height: 1.8;">
      ${a.map(e=>`<li>${e.email} <span style="color: #999; font-size: 12px;">(${e.timestamp.split("T")[1].split(".")[0]})</span></li>`).join("")}
    </ul>
    `:'<p style="color: #999;">No new subscribers today</p>'}
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      This is an automated report from <a href="https://${l}" style="color: #5B7FFF;">${l}</a><br>
      Generated at ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`;if(await c(d,i,u))return await p.kv.set("reports:lastSent",e),n.NextResponse.json({success:!0,message:"Daily report sent",stats:{total:r,today:s}});return n.NextResponse.json({error:"Failed to send email"},{status:500})}catch(e){return console.error("Daily report error:",e),n.NextResponse.json({error:"Failed to generate report"},{status:500})}}let m=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/cron/report/route",pathname:"/api/cron/report",filename:"route",bundlePath:"app/api/cron/report/route"},resolvedPagePath:"/Users/todd/Library/Mobile Documents/com~apple~CloudDocs/Personal/code/quaternity-brochure/app/api/cron/report/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:h,serverHooks:y}=m,x="/api/cron/report/route";function f(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:h})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[948,681],()=>o(9615));module.exports=r})();