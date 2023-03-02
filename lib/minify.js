
/**
 * @param {string} css
 * @returns {string}
 */
export function minifyCss (css) {
  return css.split('\n')
    .map(s => s.trim()
      .replace(/\s+{/g, '{')
      .replace(/:\s/, ':'))
    .filter(s => !!s)
    .join('')
    .replaceAll(/\/\*[\s\S]+?\*\//g, '')
}

/**
 * @param {string} html
 * @returns {string}
 */
export function minifyHtml (html) {
  return html.replace(/\s+(<(?!\/?style).+>?)/g, '$1')
}
