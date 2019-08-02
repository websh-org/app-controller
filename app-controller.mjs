import { RemoteMasterPort } from "@websh/remote-master-port";

export class AppController {
  constructor({ iframe, url, debug=false}) {
    this.iframe = iframe;
    this.debug = debug;
    const parsed = new URL(url,location.href);
    this.url = parsed.href;
    this.origin = parsed.origin;
    this.masterPort = new RemoteMasterPort('SOUTH-TOOTH',iframe,{origin:this.origin,debug:this.debug});
    this.loaded = false;
    this.connected = false;
  }
  
  load() {
    if (this.loaded) throw new Error("app-already-loaded");
   
    const promise = new Promise(async (resolve,reject)=>{
      this.iframe.onload = async () => {
        this.loaded = true;
        this.iframe.onload = null;
        try {
          this.manifest = await this.masterPort.connect();
          this.connected = true;
          resolve(this.manifest);
        } catch (err) {
          reject(err);
        }
      }
    })
    this.iframe.removeAttribute('srcdoc');
    this.iframe.src = this.url;
    return promise;
  }

  async close() {
    const timeout = setTimeout(
      ()=>{
        throw new Error("app-close-timeout");
        this.unload();
      },
      5000
    )
    try {
      await this.request('app-close');
      clearTimeout(timeout);
      this.unload();
    } catch (error) {
      clearTimeout(timeout);
      throw (error);
    }
  }

  
  async unload() {
    this.iframe.removeAttribute('src');
    this.iframe.srcdoc="Not loaded";
    await this.masterPort.disconnect();
    this.connected = false;
    this.loaded = false;
  }

  send (cmd,args={},transfer=[]) {
    this.masterPort.send(cmd,args,transfer);
  }

  request (cmd,args={},transfer=[]) {
    return this.masterPort.request(cmd,args,transfer);
  }

  on (event,fn) {
    this.masterPort.on(event,fn);
  }
}

