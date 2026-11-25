// Controlled project model governance shared by CAD, presentation, BOQ and engineering.
export const PROJECT_SCHEMA='conflow-project-model/1.0';
export const WORKFLOWS=['technical','presentation','engineering','quantitySurveying'];
export function ensureGovernance(model){
 model.schema=model.schema||PROJECT_SCHEMA;
 model.revision=model.revision||{number:Math.max(1,Number(model.version)||1),parent:null,createdAt:new Date().toISOString(),changeNote:'Initial controlled revision'};
 model.approvals=model.approvals||{};
 for(const key of WORKFLOWS)model.approvals[key]=model.approvals[key]||{status:'DRAFT',revision:null,approver:null,role:null,approvedAt:null,notes:''};
 model.analysis=model.analysis||{nodes:[],members:[],supports:[],loadCases:[],combinations:[],units:{length:model.units||'m',force:'kN',stress:'MPa'},designCode:null};
 model.presentation=model.presentation||{backend:'webgl-realtime',jobs:[],settings:{}};
 return model;
}
export function reviseModel(model,note='Model geometry or properties changed'){
 ensureGovernance(model);
 const old=model.revision.number||1;
 model.revision={number:old+1,parent:old,createdAt:new Date().toISOString(),changeNote:note};
 for(const key of WORKFLOWS){const a=model.approvals[key];if(a.status==='APPROVED')model.approvals[key]={...a,status:'STALE',notes:(a.notes||'')+' | Invalidated by model revision '+model.revision.number};}
 return model;
}
export function recordApproval(model,workflow,{approver,role,decision='APPROVED',notes='' }={}){
 ensureGovernance(model);
 if(!WORKFLOWS.includes(workflow))throw new Error('Unknown approval workflow');
 if(!approver?.trim()||!role?.trim())throw new Error('Approver name and professional role are required');
 if(!['APPROVED','REJECTED','REVIEW_REQUIRED'].includes(decision))throw new Error('Unsupported approval decision');
 model.approvals[workflow]={status:decision,revision:model.revision.number,approver:approver.trim(),role:role.trim(),approvedAt:new Date().toISOString(),notes};
 return model.approvals[workflow];
}
export function approvalIsCurrent(model,workflow){const a=model.approvals?.[workflow];return !!a&&a.status==='APPROVED'&&a.revision===model.revision?.number}
