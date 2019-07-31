import { RemoteMasterPort } from "@websh/remote-master-port";

export class AppController {
  constructor({ iframe, url}) {
    this.iframe = iframe;
    const parsed = new URL(url,location.href);
    console.log(url,parsed);
    this.url = parsed.href;
    this.origin = parsed.origin;
  }
  
  load() {
    return new Promise(async (resolve,reject)=>{
      const timeout = setTimeout(
        () => reject(new Error('app-connect-timeout')),
        5000 
      )
      this.iframe.onload = async () => {
        console.log('loaded');
        this.masterPort = new RemoteMasterPort('SOUTH-TOOTH',iframe,this.origin);
        try {
          this.manifest = await this.masterPort.connect();
          clearTimeout(timeout);
          console.log('connected',this.manifest);
          resolve(this.manifest);
        } catch (err) {
          reject(err);
        }
      }
      this.iframe.src = this.url;
    })
  }

  async unload() {
    //TODO
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