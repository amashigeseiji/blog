import http from 'http'
import url from 'url'
import fs from 'node:fs/promises'

const contentType = (ext) => {
    switch (ext) {
      case 'html':
        return 'text/html'
      case 'css':
        return 'text/css'
      case 'javascript':
        return 'text/javascript'
      case 'json':
        return 'application/json'
      default:
        return 'application/octet-stream'
    }
}

http.createServer((request, response) => {
  console.log(request.method, request.url)
  const url = new URL(`http://${request.headers.host}${request.url}`)
  let path = url.pathname === '/' ? '/index.html' : url.pathname
  if (!path.includes('.')) {
    path += '.html'
  }
  fs.readFile(`./dist${path}`, 'utf8').catch(error => {
    console.log(error)
    response.writeHead(404)
    response.end('404 not found')
  }).then(file => {
    const ext = path.split('.')[1]
    response.writeHead(200, { 'Content-Type': contentType(ext) })
    response.end(file)
  })
}).listen(8080)
