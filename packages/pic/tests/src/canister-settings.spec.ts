import { PocketIc } from '../../src';
import { idlFactory } from '../test-canister/declarations/test_canister.did';
import { WASM_PATH } from './util';

describe('canister settings', () => {
  let pic: PocketIc;

  beforeEach(async () => {
    pic = await PocketIc.create(process.env.PIC_URL);
  });

  afterEach(async () => {
    await pic.tearDown();
  });

  it('should enforce the Wasm memory limit when setting up a canister', async () => {
    await expect(
      pic.setupCanister({
        idlFactory,
        wasm: WASM_PATH,
        wasmMemoryLimit: 1n,
      }),
    ).rejects.toThrow();
  });
});
