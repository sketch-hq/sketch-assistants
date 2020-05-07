console.log(
  require('fs')
    .readdirSync(`${__dirname}/src/rules`)
    .filter((dir) => !dir.startsWith('.'))
    .reduce((acc, dir) => {
      return `${acc}\n- [\`${dir}\`](./src/rules/${dir})`
    }, ''),
)
