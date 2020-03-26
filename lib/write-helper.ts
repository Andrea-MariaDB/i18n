import * as path from 'path'
import * as fs from 'fs-extra'
import { IResponse as IRoggyResponse } from 'roggy'
import { englishBasepath } from './constants'

export function writeHelper<T = unknown>(
  file: string,
  data: Record<string, T>
) {
  return fs.writeFileSync(
    path.join(__dirname, `../dist/${file}.json`),
    JSON.stringify(data, null, 2)
  )
}

export async function writeToPackageJSON(key: string, value: string) {
  const pkg = await import('../package.json')
  // @ts-ignore
  pkg[key] = value
  fs.writeFileSync(
    require.resolve('../package.json'),
    JSON.stringify(pkg, null, 2)
  )
}

export function writeDoc(doc: IRoggyResponse) {
  const filename = path.join(englishBasepath, 'docs', doc.filename)
  fs.mkdirSync(path.dirname(filename))
  fs.writeFileSync(filename, doc.markdown_content)
  // console.log('   ' + path.relative(englishBasepath, filename))
}

export function writeBlog(doc: IRoggyResponse) {
  const filename = path.join(englishBasepath, 'website/blog', doc.filename)
  fs.mkdirSync(path.dirname(filename))
  fs.writeFileSync(filename, doc.markdown_content)
}
