import { Module } from 'node:module';
import type { PocketIcServer as PocketIcServerType } from '../src/pocket-ic-server.js';

type ResolveFilename = (
  request: string,
  parent: NodeModule | null,
  isMain: boolean,
  options?: object,
) => string;

type ModuleWithInternals = typeof Module & {
  _resolveFilename: ResolveFilename;
};

// Install a resolver hook so that `.js` extension imports resolve to `.ts` source
// files when running in Jest's CJS context. Jest disables ts-node's
// experimentalResolver after loading jest.config.ts, leaving source files with
// ESM-style `.js` imports unresolvable without this shim.
const mod = Module as ModuleWithInternals;
const originalResolveFilename = mod._resolveFilename.bind(mod);

mod._resolveFilename = function jsToTsResolver(
  request,
  parent,
  isMain,
  options,
) {
  try {
    return originalResolveFilename(request, parent, isMain, options);
  } catch (err) {
    if (
      typeof request === 'string' &&
      request.endsWith('.js') &&
      (err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND'
    ) {
      try {
        return originalResolveFilename(
          `${request.slice(0, -3)}.ts`,
          parent,
          isMain,
          options,
        );
      } catch {
        // fall through and re-throw original error
      }
    }
    throw err;
  }
};

// Import PocketIcServer after the resolver hook is in place, so that the
// barrel import chain (index.ts → identity.js → …) can locate `.ts` files.
// This must be a function-level import to guarantee sequencing relative to the
// hook install above (top-level `import` statements are hoisted by the TS→CJS
// transpiler and would run before the hook code).
function loadPocketIcServer(): typeof PocketIcServerType {
  // Dynamic require is intentional: we need the resolver hook above to be
  // active before Node resolves any `.js`-extension import in the source tree.
  const mod = require('../src') as {
    PocketIcServer: typeof PocketIcServerType;
  };
  return mod.PocketIcServer;
}

module.exports = async function (): Promise<void> {
  const pic = await loadPocketIcServer().start();
  const url = pic.getUrl();

  process.env.PIC_URL = url;
  global.__PIC__ = pic;
};
