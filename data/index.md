<!--
title: INDEX
template: index
index: false
url: /
published: 2023-03-03 20:21
modified: 2023-03-03 20:21
-->
# INDEX

{script}
return helper.readIndex()
.then((index) => {
  return index.sort((a, b) => new Date(b.published) - new Date(a.published))
}).then((index) => {
  const pages = {}
  for (const page of index) {
    if (page.index) {
      const published = new Date(page.published)
      const year = `${published.getFullYear()}年`
      const date = `${year}${published.getMonth() +1}月${published.getDate()}日`
      if (!pages[year]) {
        pages[year] = []
      }
      pages[year].push(`${date}:&nbsp;<a href="${page.url}">${page.title}</a>`)
    }
  }
  return pages
})
{/script}
