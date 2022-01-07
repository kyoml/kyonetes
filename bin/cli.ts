import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { generate } from '../lib/generator';

yargs(hideBin(process.argv))
  .command('template [kyoml_file]', 'renders the K8s template', (yargs) => {
    return yargs
      .positional('kyoml_file', { describe: 'file to render', type: 'string' })
  }, (argv) => {
    console.log(generate(argv.kyoml_file as string));
  })
  .parse()
