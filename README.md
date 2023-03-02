# tenjuu99@blog

## Write a blog

browser preview `http://localhost:8080/`

```
npm run watch
```

edit markdown file in `./data/`.

## Template Engine

### VARIABLES

You can define `variables` in html comment.

```markdown
<!--
foo: fooVariableContent
bar: varVariableContent
-->

## this is markdown text

some text
```

and in template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  {{foo}}
  {{bar}}
</body>
</html>
```

`{{foo}}` and `{{bar}}` will be replaced to `'fooVariableContent'` and `'barVariableContent'`

### IF

```markdown
<!--
someVariable: true
-->
{if someVariable}
This content will be present.
{/if}

{if undefinedValue}
This content will be removed.
{/if}
```

### SCRIPT

```markdown
{script}
// write javascript and return value
{/script}
```
