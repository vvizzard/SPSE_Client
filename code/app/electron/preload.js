const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const i18nextBackend = require("i18next-electron-fs-backend");
const Store = require("secure-electron-store").default;
const ContextMenu = require("secure-electron-context-menu").default;
const SecureElectronLicenseKeys = require("secure-electron-license-keys");
const log = require("electron-log");

// Create the electron store to be made available in the renderer process
const store = new Store();

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  i18nextElectronBackend: i18nextBackend.preloadBindings(ipcRenderer),
  store: store.preloadBindings(ipcRenderer, fs),
  contextMenu: ContextMenu.preloadBindings(ipcRenderer),
  licenseKeys: SecureElectronLicenseKeys.preloadBindings(ipcRenderer),

  send: (channel, name, entity, val = 0) => {
    log.info("send:");
    log.info([channel, name, entity, val]);

    let validChannels = ["asynchronous-validate"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("asynchronous-reply", (_, arg) => {
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity, val);
      });
    }
  },

  add(channel, name, entity) {
    log.info("add:");
    log.info([channel, name, entity]);

    let validChannels = ["asynchronous-add"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("asynchronous-reply", (_, arg) => {
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
      // return ipcRenderer.invoke(channel, name, entity)
    }
  },

  register(channel, name, entity) {
    log.info("register:");
    log.info([channel, name, entity]);

    let validChannels = ["asynchronous-register"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("asynchronous-reply", (_, arg) => {
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
      // return ipcRenderer.invoke(channel, name, entity)
    }
  },

  get(channel, name, entity = {}) {
    log.info("get:");
    log.info([channel, name]);

    let validChannels = ["asynchronous-get"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, name, entity);
    }
  },

  getTrans(channel, name, entity = {}) {
    log.info("get_trans : args");
    log.info([channel, name, entity]);

    let validChannels = [
      "asynchronous-get-trans",
      "asynchronous-get-district-validation",
      "valider-terminer",
      "rejeter",
      "terminer",
      "asynchronous-delete",
      "asynchronous-deletes",
      "synchroniser",
    ];

    log.info(validChannels.includes(channel));
    log.info("-----------------------------");

    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("asynchronous-reply", (_, arg) => {
          log.info("get_trans : response ");
          log.info(arg);
          log.info("-----------------------");
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  getTrans2(channel, name, entity = {}) {
    log.info('"asynchronous-get-district-validation":');
    log.info([channel, name, entity]);
    let validChannels = ["asynchronous-get-district-validation"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("districts", (_, arg) => {
          log.info("asynchronous-get-district-validation");
          log.info(arg);
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  getPTA(channel, name, entity = []) {
    log.info("get_sql : args");
    log.info([channel, name, entity]);

    let validChannels = [
      "asynchronous-get-pta",
    ];

    log.info(validChannels.includes(channel));
    log.info("-----------------------------");

    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("asynchronous-reply", (_, arg) => {
          log.info("get_sql : response ");
          log.info(arg);
          log.info("-----------------------");
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  getMap(channel, name, entity = {}) {
    log.info("getMap:");
    log.info([channel, name]);

    let validChannels = ["map-get"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, name, entity);
    }
  },

  getMap2(channel, name, entity = {}) {
    log.info("getMap:");
    log.info([channel, name]);

    let validChannels = ["map-get2"];
    if (validChannels.includes("map-get2")) {
      return ipcRenderer.invoke("map-get2", name, entity);
    }
  },

  exporter(channel, name, entity = {}) {
    log.info("export:");
    log.info([channel, name]);

    let validChannels = ["export"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("export-reply", (_, arg) => {
          log.info("export response : ");
          log.info(arg);
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  importer(channel, name, entity = {}) {
    log.info("import:");
    log.info([channel, name, entity]);

    let validChannels = ["import"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("import-reply", (_, arg) => {
          log.info("import response : ");
          log.info(arg);
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  upload(channel, name, entity = {}) {
    log.info("import:");
    log.info([channel, name]);

    let validChannels = ["import-geojson"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("reply", (_, arg) => {
          log.info("import response : ");
          log.info(arg);
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },

  exporterReponse(channel, name, entity = {}) {
    log.info("export_reponse:");
    log.info([channel, name]);

    let validChannels = ["export_reponse"];
    if (validChannels.includes(channel)) {
      return new Promise((resolve) => {
        ipcRenderer.once("export-reply", (_, arg) => {
          log.info("export_reponse response : ");
          log.info(arg);
          resolve(arg);
        });
        ipcRenderer.send(channel, name, entity);
      });
    }
  },
});
