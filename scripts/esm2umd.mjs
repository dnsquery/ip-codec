#!/usr/bin/env node
import fs from 'fs/promises'
import esm2umd from 'esm2umd'

;(async () => {
  const dirname = new URL('..', import.meta.url)
  const files = await fs.readdir(dirname)
  for (const file of files.filter(file => file.endsWith('.mjs'))) {
    const name = file.replace(/\.mjs$/, '')
    const esmFile = await fs.readFile(new URL(file, dirname))
    const target = `${name}.cjs`
    await fs.writeFile(
      new URL(target, dirname),
      esm2umd(process.argv[2], esmFile, { importInterop: 'node' })
    )
  }
})()
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
