// @flow

import { v4 as uuidv4 } from 'uuid';

export const oneOutOf = (denominator:number) => Math.random() < 1 / denominator;

const arrayBuffer = new ArrayBuffer(1024 * 1024 * 100);

export const generateRandomBlob = () => {
  const begin = Math.round(1024 * 1024 * 100 * Math.random());
  const end = Math.round(Math.random() * (1024 * 1024 * 100 - begin));
  return new Blob([arrayBuffer.slice(begin, end)], { type: 'application/octet-stream' });
};

export const generateRandomString = () => {
  const values = [];
  for (let i = 0; i < Math.random() * 100; i += 1) {
    values.push(uuidv4());
  }
  return values.join('-');
};

export const generateRandomObject = (maxDepth:number) => {
  const values = generateRandomArray(maxDepth - 1);
  const o:Object = {};
  for (const value of values) {
    o[uuidv4()] = value;
  }
  return o;
};

export const generateRandomValue = (maxDepth:number) => {
  if (typeof maxDepth !== 'number') {
    throw new TypeError(`Unable to generate random value with maxDepth type ${typeof maxDepth}`);
  }
  if (maxDepth <= 1) {
    switch (Math.floor(Math.random() * 5)) {
      case 0:
        return generateRandomBlob();
      case 1:
        return generateRandomString();
      case 2:
        return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
      case 3:
        return Math.random() > 0.5;
      default:
        return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    }
  }
  switch (Math.floor(Math.random() * 6)) {
    case 0:
      return generateRandomBlob();
    case 1:
      return generateRandomString();
    case 2:
      return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    case 3:
      return Math.random() > 0.5;
    case 4:
      return generateRandomArray(maxDepth - 1);
    case 5:
      return generateRandomObject(maxDepth - 1);
    default:
      return generateRandomValue(maxDepth - 1);
  }
};

export const generateRandomArray = (maxDepth:number) => {
  const argumentCount = Math.round(Math.random() * 10);
  const args = [];
  for (let i = 0; i < argumentCount; i += 1) {
    args.push(generateRandomValue(maxDepth - 1));
  }
  return args;
};
