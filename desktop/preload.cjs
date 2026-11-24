const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getInfo: () => ipcRenderer.invoke('app:info'),
  listProjects: () => ipcRenderer.invoke('projects:list'),
  loadDesign: () => ipcRenderer.invoke('design:load'),
  saveDesign: (document) => ipcRenderer.invoke('design:save', document),
  saveProject: (project) => ipcRenderer.invoke('projects:save', project),
  getSyncStatus: () => ipcRenderer.invoke('sync:status')
});
