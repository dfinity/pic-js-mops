import { PocketIcServer } from 'pic-js-mops';

module.exports = async function (): Promise<void> {
  const pic = await PocketIcServer.start();
  const url = pic.getUrl();

  process.env.PIC_URL = url;
  global.__PIC__ = pic;
};
