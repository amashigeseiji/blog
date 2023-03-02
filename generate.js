import { program } from "commander";
import fs from "node:fs/promises";
// markedモジュールからmarkedオブジェクトをインポートする
import { marked } from "marked";

const file = {
  getContent: async path => await fs.readFile(path, 'utf8'),
  template: async (name = 'default') => {
    const template = await file.getContent(`./template/${name}.html`)
    const matched = [...template.matchAll(/{{\s?([\w-]+)\s?}}/g)]
    const replace = Object.fromEntries(matched.map(match => [match[1].toLowerCase(), match[0]]))

    const renderer = (data) => {
      let replaced = template
      for (const elm in replace) {
        replaced = replaced.replace(replace[elm], data[elm])
      }
      return replaced
    }

    return renderer
  },
  markdown: async name => {
    return await file.getContent(`./data/${name}.md`)
  },
}

marked.use({
  renderer: {
    html(htmlString) {
      // コメント中からデータを拾う
      // let で定義されているスコープ外の変数を操作
      if (htmlString.startsWith('<!--')) {
        try {
          const variables = Object.fromEntries(
            htmlString
            .split('\n')
            .filter(line => line.includes(':'))
            .map(line => line.split(/:\s*/))
          )
          Object.assign(data, variables)
        } catch (error) {
          console.log(error)
        }
        return ''
      }

      return htmlString
    }
  }
})

program.parse(process.argv);
const render = await file.template('default')
const markdown = await file.markdown(program.args[0])

// markded の render.html で必要
let data = {}
data.markdown = marked.parse(markdown)
console.log(render(data))
