import {  DirectiveFunc } from 'kyoml'
import { Parser } from 'yargs/helpers'
import { Json } from './types';
import _ from 'lodash';

export const userinput : DirectiveFunc = ({ value, path, set }) => {
  if (typeof value !== 'object') {
    throw new Error(`@userinput: Failed to modify '${path}', expected an object, found ${typeof value} instead`);
  }

  const { argv } = Parser.detailed(process.argv.slice(2));
  const userValues = _.omit(argv, '_');
  set({
    ...value,
    ...userValues
  })
}

export const extend : DirectiveFunc = ({ value, key, get, set, path }, source : any) => {
  if (!source || typeof source !== 'string') {
    throw new Error(`[kyoml-extend-plugin] @extend should be called with a path`);
  }

  const fullSource = `document.${source}`;
  const sourceObj = get(fullSource);
  const sourceType = typeof sourceObj;
  const destType = typeof value;

  if (sourceType !== 'object') {
    throw new Error(`[kyoml-extend-plugin] Cannot read from source '${fullSource}', expected an object, found ${sourceType} instead`);
  }

  if (destType !== 'object') {
    throw new Error(`[kyoml-extend-plugin] Failed to extend '${path}', expected an object, found ${destType} instead`);
  }

  if (path.indexOf(fullSource) === 0) {
    throw new Error(`[kyoml-extend-plugin] Extending a parent would cause circular reference`);
  }

  const copy = { ...value }

  const traverse = (obj: Json, prefixes : string[] = []) => {
    for (const key in obj) {
      const data = obj[key];
      const pathKeys = [...prefixes, key];
      const path = pathKeys.join('.');

      if (typeof data === 'object') {
        traverse(data, pathKeys);
      } else {
        const existingData = _.get(copy, path);
        if (existingData === null || existingData === undefined) {
          _.set(copy, path, data);
        }
      }
    }
  }

  traverse(sourceObj);

  set(copy);
}
