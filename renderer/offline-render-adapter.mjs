// Offline renderer adapter contract. Packages a deterministic scene snapshot for a future native/path-tracing backend.
export const OFFLINE_RENDER_SCHEMA='conflow-offline-render-job/1.0';
export function createOfflineRenderJob(project,{name='Untitled render',camera={},settings={},backend='native-pathtracer'}={}){
 if(!project?.id)throw new Error('A saved controlled project model is required');
 return {schema:OFFLINE_RENDER_SCHEMA,jobId:'render-'+Date.now(),projectId:project.id,sourceRevision:project.revision?.number||project.version||1,name,backend,status:'QUEUED_FOR_EXTERNAL_RENDERER',createdAt:new Date().toISOString(),scene:{units:project.units||'m',elements:project.elements||[],materials:project.renderAssets||{},environment:settings,camera},requirements:{rendererBackend:backend,features:['progressive path tracing','multiple light bounces','physically based area lights','texture-aware material compilation','denoising','high dynamic range output'],notImplementedInWebGLClient:true},warning:'This is a portable render-job manifest. ConFlow does not execute offline path tracing or denoising in this client build.'};
}
export function validateOfflineRenderResult(result,job){
 if(!result||result.schema!=='conflow-offline-render-result/1.0')throw new Error('Unsupported offline render result schema');
 if(result.jobId!==job.jobId||result.projectId!==job.projectId||result.sourceRevision!==job.sourceRevision)throw new Error('Render result does not match the queued project revision');
 if(!result.renderer||!result.rendererVersion||!result.completedAt||!result.output)throw new Error('Missing renderer provenance or output metadata');
 return {...result,verifiedAgainstJob:true,notice:'Provenance and source revision matched. Image pixels and render quality have not been independently validated.'};
}
