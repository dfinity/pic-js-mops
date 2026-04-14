import { PocketIcServer } from 'pic-js-mops';

declare global {
  declare var __PIC__: PocketIcServer;

  namespace NodeJS {
    interface ProcessEnv {
      PIC_URL: string;
    }
  }
}
