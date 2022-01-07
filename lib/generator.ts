import { compile, DirectiveFunc } from 'kyoml'
import * as directives from './directives'
import { Json } from './types'
import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'

export function generate(file : string) {
  const kyostr = fs.readFileSync(file).toString()
  const kubeObjects : Json[] = []

  const kind : DirectiveFunc = ({ value, key }, type : unknown) => {
    if (typeof type !== "string") {
      throw "@kind directives should be given a K8s type as a string"
    }

    const kubeObject : Json = {
      apiVersion: 'apps/v1',
      kind: _.capitalize(_.camelCase(type)),
      metadata: { name: key },
      ...value
    }

    kubeObjects.push(kubeObject);
  };

  compile(kyostr, {
      directives: {
        ...directives,
        kind
      }
    }
  )

  return kubeObjects
    .map(ko => JSON.parse(JSON.stringify(ko)))
    .map(ko => yaml.dump(ko)).join('\n---\n');
}
