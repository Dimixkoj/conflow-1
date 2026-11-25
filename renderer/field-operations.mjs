// Field operations validation and consent-aware WhatsApp export parsing.
export const FIELD_RECORD_TYPES=['staff','site_report','team_message','whatsapp_review'];
export function validateStaff(input){
 const name=String(input?.name||'').trim(),position=String(input?.position||'').trim(),role=String(input?.role||'').trim();
 if(!name||!position||!role)throw new Error('Staff name, company position and access role are required');
 if(input.privacyAcknowledged!==true)throw new Error('Please acknowledge the staff-data notice before saving this profile');
 return {...input,name,position,role,privacyAcknowledged:true,privacyAcknowledgedAt:new Date().toISOString(),phone:String(input.phone||'').trim(),employmentType:input.employmentType||'Staff',active:input.active!==false,updatedAt:new Date().toISOString()};
}
export function validateSiteReport(input){
 if(!String(input?.projectId||'').trim())throw new Error('Select a project for this site report');
 if(!String(input?.staffId||'').trim())throw new Error('A registered staff member must submit the report');
 if(!String(input?.summary||'').trim())throw new Error('Enter a site update');
 return {...input,summary:String(input.summary).trim(),progressPercent:Math.max(0,Math.min(100,Number(input.progressPercent)||0)),status:input.status||'Submitted for review',createdAt:new Date().toISOString()};
}
export function parseWhatsAppExport(text){
 const raw=String(text||'');if(!raw.trim())throw new Error('The selected WhatsApp export is empty');
 if(raw.length>2_000_000)throw new Error('WhatsApp text export exceeds the 2 MB review limit');
 const lines=raw.split(/\\r?\\n/);
 return {text:raw,lineCount:lines.length,messageCount:lines.filter(x=>/^\\[?\\d{1,4}[/-]\\d{1,2}[/-]\\d{2,4}/.test(x)).length,preview:lines.slice(0,8).join('\\n'),importedAt:new Date().toISOString(),source:'User-selected WhatsApp text export'};
}
export function canSubmitWhatsAppReview({consent,staffId,projectId}){return consent===true&&!!String(staffId||'').trim()&&!!String(projectId||'').trim()}
