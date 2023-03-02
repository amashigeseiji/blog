import fs from "node:fs/promises";
import path from 'path'
import * as helper from '../helper/index.js'
import { minifyCss, minifyHtml } from './minify.js'

/**
 * @param {string} text
 * @params {object} variables
 * @return {text}
 */
const replaceVariablesFilter = (text, variables) => {
  const matched = [...text.matchAll(/{{\s?([\w-]+)\s?}}/g)]
  const replace = Object.fromEntries(matched.map(match => [match[1].toLowerCase(), match[0]]))
  let replaced = text
  for (const elm in replace) {
    replaced = replaced.replaceAll(replace[elm], variables[elm])
  }
  return replaced
}

/**
 * @param {string} condition
 * @params {object} variables
 * @return {bool}
 */
const ifConditionEvaluator = (condition, variables) => {
  if (condition.includes('=')) {
    const segmented = condition.match(/(?<left>[\S]+)\s(?<operator>!=|==)\s(?<right>[\S]+)/)
    let {left, operator, right} = segmented.groups
    if (variables.hasOwnProperty(left)) {
      left = variables[left]
    } else {
      try {
        left = eval(left)
      } catch (e) {
        left = undefined
      }
    }
    if (variables.hasOwnProperty(right)) {
      right = variables[right]
    } else {
      try {
        right = eval(right)
      } catch (e) {
        right = undefined
      }
    }
    switch (operator) {
      case '==':
        return left == right
      case '!=':
        return left != right
    }
  } else {
    if (variables.hasOwnProperty(condition)) {
      return !!variables[condition]
    }
    return false
  }
}

/**
 * @param {string} text
 * @param {object} variables
 * @returns {string}
 */
const replaceIfFilter = (text, variables) => {
  const ifRegexp = new RegExp(/\{if\s(?<condition>[\s\S]+?)}(?<content>[\s\S]*?)\{\/if}/g)
  const matched = [...text.matchAll(ifRegexp)]
  for (const item of matched) {
    const target = item[0]
    const content = item.groups.content
    if (ifConditionEvaluator(item.groups.condition, variables)) {
      text = text.replace(target, content)
    } else {
      text = text.replace(target, '')
    }
  }
  return text
}

/**
 * 配列を再帰的に順不同リストに変換する
 * @param {Array|string} arrayOrText
 * @returns {mixed}
 */
const arrayToList = (arrayOrText) => {
  if (typeof arrayOrText === 'string') {
    return `<li>${arrayOrText}</li>`
  }
  if (Array.isArray(arrayOrText)) {
    let resultListText = '<ul>'
    for (const item of arrayOrText) {
      if (Array.isArray(item)) {
        resultListText += `<li>${arrayToList(item)}</li>`
      } else {
        resultListText += `<li>${item}</li>`
      }
    }
    resultListText += '</ul>'
    arrayOrText = resultListText
  }
  return arrayOrText
}

const replaceScriptFilter = async (text, variables) => {
  let replaced = text
  const scriptRegexp = new RegExp(/{script}(?<script>[\s\S]*?)\{\/script}/g)
  const scripts = [...text.matchAll(scriptRegexp)].map((matched) => {
    return {
      replace: matched[0],
      script: matched.groups.script.trim("\n"),
    }
  })
  for (const script of scripts) {
    let result = new Function('helper', 'variables', script.script)(helper, variables)
    if (result instanceof Promise) {
      result = await result
    }
    if (Array.isArray(result)) {
      result = arrayToList(result)
    } else if (typeof result === 'object') {
      const resultText = []
      for (const key in result) {
        resultText.push(`<h3>${key}</h3>`)
        if (Array.isArray(result[key])) {
          resultText.push(arrayToList(result[key]))
        } else {
          resultText.push(`<p>${result[key]}</p>`)
        }
      }
      result = resultText.join('\n')
    }
    replaced = replaced.replace(script.replace, result)
  }
  return replaced
}

const includeFilter = async (text) => {
  let replaced = text
  const includeRegexp = new RegExp(/\{\s*include\('([\w\./]+)'\)\s*\}/g)
  const include = [...text.matchAll(includeRegexp)].map(matched => [matched[0], matched[1]])
  for (const filename in include) {
    let includeFile = await fs.readFile(include[filename][1], 'utf8')
    if (include[filename][1].endsWith('.css')) {
      includeFile = minifyCss(includeFile)
    }
    replaced = replaced.replace(include[filename][0], includeFile)
  }
  return replaced
}

export {
  replaceIfFilter,
  replaceScriptFilter,
  replaceVariablesFilter,
  includeFilter
}
