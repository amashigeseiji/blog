import fs from "node:fs/promises";

export async function readIndex () {
  return await fs.readFile('./data/index.json', 'utf8').then(text => JSON.parse(text)).catch(error => [])
}

export function dateFormat(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
