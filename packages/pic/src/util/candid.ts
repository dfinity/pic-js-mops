import { IDL } from '@icp-sdk/core/candid';
import { isNil } from './is-nil.js';

export function optional<T>(value: T | undefined | null): [] | [T] {
  return isNil(value) ? [] : [value];
}

export function decodeCandid<T>(types: IDL.Type[], data: Uint8Array): T | null {
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  const returnValues = IDL.decode(types, buffer);

  switch (returnValues.length) {
    case 0:
      return null;
    case 1:
      return returnValues[0] as T;
    default:
      return returnValues as T;
  }
}
