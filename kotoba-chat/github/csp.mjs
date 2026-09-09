const metaPattern=/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"\s*\/?\s*>/gi;
export function configuredApiOrigin(apiBase) {
 const u=new URL(apiBase);
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/functions/v1/ojiisan-api')throw new Error('Invalid public Supabase API URL');
 return u.origin;
}
function policy(html) {
 const matches=[...html.matchAll(metaPattern)];
 if(matches.length!==1)throw new Error('Expected one CSP meta tag');
 const directives=matches[0][1].split(';').map(x=>x.trim()).filter(Boolean);
 if(directives.filter(x=>x.split(/\s+/)[0]==='connect-src').length!==1)throw new Error('Expected one connect-src directive');
 return {tag:matches[0][0],value:matches[0][1],directives};
}
export function assertApiCsp(html,apiBase) {
 const actual=policy(html).directives.find(x=>x.startsWith('connect-src '));
 if(actual!=="connect-src 'self' "+configuredApiOrigin(apiBase))throw new Error('Production CSP does not match the configured API origin');
}
export function alignApiCsp(html,apiBase) {
 const p=policy(html),origin=configuredApiOrigin(apiBase);
 const value=p.directives.map(x=>x.split(/\s+/)[0]==='connect-src'?"connect-src 'self' "+origin:x).join('; ');
 const result=html.replace(p.tag,p.tag.replace(p.value,value));assertApiCsp(result,apiBase);return result;
}
