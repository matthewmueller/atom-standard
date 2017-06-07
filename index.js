const scope = ['source.js', 'source.js.jsx', 'source.js.jquery', 'source.vue']

const defaults = {
  prettier: true,
  fix: true
}

module.exports = {
  scope: scope,
  activate: function (state) {
    window.requestIdleCallback(function () {
      require('atom-package-deps')
        .install('atom-standard', true)
        .catch(function (err) {
          window.atom.notifications.addError('Error activating atom-standard', {
            detail: err.message,
            dismissable: true
          })
        })
    })
    // console.time('requiring')
    // .then(function () {
    //   console.timeEnd('requiring')
    // })
  },
  provideLinter: function () {
    const lint = Lint()
    return {
      name: 'standard',
      scope: 'file',
      grammarScopes: scope,
      lintsOnChange: false,
      lint: lint
    }
  }
}

function Lint () {
  let standard = null
  let setText = null
  let prettier = null

  return function lint (textEditor) {
    return new Promise(function (resolve, reject) {
      window.requestIdleCallback(resolve)
    }).then(function () {
      standard = standard || unsafe(() => require('standard'))
      prettier = prettier || require('prettier')
      setText = setText || require('atom-set-text')
      let fileContent = textEditor.getText()
      const filePath = textEditor.getPath()
      // console.time('conf')
      const pkgconf = require('pkg-config')(null, {
        cwd: filePath,
        root: 'standard',
        cache: false
      })
      // console.timeEnd('conf')
      const conf = Object.assign({}, defaults, pkgconf)

      // pass through prettier first
      if (conf.prettier) {
        try {
          // console.time('prettier')
          fileContent = prettier.format(fileContent, {
            semi: false,
            singleQuote: true
          })
          // console.timeEnd('prettier')
        } catch (e) {
          // this will happen when there's a parsing error
          // let standard handle it down the stack
        }
      }

      return new Promise(function (resolve, reject) {
        unsafe(function () {
          // console.time('standard')
          standard.lintText(fileContent, conf, function (err, res) {
            if (err) return reject(err)
            // console.timeEnd('standard')

            // format the text
            var fixed =
              res &&
              Array.isArray(res.results) &&
              res.results[0] &&
              res.results[0].output
            if (fixed) setText(fixed, textEditor)

            if (!res.errorCount) return resolve([])
            resolve(formatErrors(filePath, res))
          })
        })
      })
    })
  }
}

function unsafe (fn) {
  return require('loophole').allowUnsafeNewFunction(fn)
}

function getRange (line, col, src, lineStart) {
  line = typeof line !== 'undefined' ? parseInt(line - 1 + lineStart, 10) : 0
  col = typeof col !== 'undefined' ? parseInt(col - 1, 10) : 0
  src = src || ''
  src = src.substring(0, col)
  return [[line, col - src.trim().length], [line, col]]
}

function formatErrors (filePath, output) {
  var msgs = output.results[0].messages
  return msgs.map(function (msg) {
    return {
      severity: msg.fatal ? 'error' : 'warning',
      location: {
        file: filePath,
        position: getRange(msg.line, msg.column, msg.source, 0)
      },
      excerpt: msg.message,
      description: typeof msg.source === 'string' ? msg.source.trim() : ''
    }
  })
}
