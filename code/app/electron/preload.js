const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const i18nextBackend = require("i18next-electron-fs-backend");
const Store = require("secure-electron-store").default;
const ContextMenu = require("secure-electron-context-menu").default;
const SecureElectronLicenseKeys = require("secure-electron-license-keys");
const log = require('electron-log')

// Create the electron store to be made available in the renderer process
const store = new Store();

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  i18nextElectronBackend: i18nextBackend.preloadBindings(ipcRenderer),
  store: store.preloadBindings(ipcRenderer, fs),
  contextMenu: ContextMenu.preloadBindings(ipcRenderer),
  licenseKeys: SecureElectronLicenseKeys.preloadBindings(ipcRenderer),
  
  send: (channel, name, entity, val=0) => {

    log.info('send:')
    log.info([channel, name, entity, val])

    let validChannels = ["asynchronous-validate"];
    if (validChannels.includes(channel)) {
      return new Promise(resolve => {
        ipcRenderer.once('asynchronous-reply', (_, arg) => {
            resolve(arg);
        });
        ipcRenderer.send(channel, name, entity, val);
      });
    }
  },

  add(channel, name, entity) {
    
    log.info('add:')
    log.info([channel, name, entity])

    let validChannels = ["asynchronous-add"];
    if (validChannels.includes(channel)) {
      return new Promise(resolve => {
        ipcRenderer.once('asynchronous-reply', (_, arg) => {
            resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
      // return ipcRenderer.invoke(channel, name, entity)
    }
  },

  get(channel, name, entity={}) {
    
    log.info('get:')
    log.info([channel, name])

    let validChannels = ["asynchronous-get"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, name, entity)
    }
  },

  getTrans(channel, name, entity={}) {
    
    log.info('get_trans:')
    log.info([channel, name, entity])

    let validChannels = ["asynchronous-get-trans"];
    if (validChannels.includes(channel)) {
      return new Promise(resolve => {
        ipcRenderer.once('asynchronous-reply', (_, arg) => {
            log.info("get_trans response : ");
            log.info(arg);
            resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  }

});
