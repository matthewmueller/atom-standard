const scope = ['source.js', 'source.js.jsx', 'source.js.jquery', 'source.gfm', 'source.vue']

const defaults = {
	fix: true 
}

module.exports = {
  scope: scope,
  activate: function(state) {
  	require('atom-package-deps')
		.install('atom-standard', true)
		.catch(function (err) {
			atom.notifications.addError('Error activating atom-standard', {
			  detail: err.message,
			  dismissable: true
			})
		})
	},
  provideLinter: function () {
  	const standard = unsafe(function () { return require('standard') })
  	const setText = require('atom-set-text')

  	return {
	    name: 'standard',
	    scope: 'file',
	    grammarScopes: scope,
	    lintsOnChange: false,
	    lint: function (textEditor) {
	      const fileContent = textEditor.getText()
	      const filePath = textEditor.getPath()
	      const fileScope = textEditor.getGrammar().scopeName
	      const pkgconf = require('pkg-config')(null, { cwd: filePath, root: 'standard', cache: false })
	      const conf = Object.assign({}, defaults, pkgconf)

	      return new Promise(function (resolve, reject) {
	      	unsafe(function () {
		      	standard.lintText(fileContent, conf, function (err, res) {
		      		if (err) return reject(err)

		      		// format the text
		      		var fixed = res && Array.isArray(res.results) && res.results[0] && res.results[0].output
		      		if (fixed) window.requestAnimationFrame(function () { setText(fixed, textEditor) })

		      		if (!res.errorCount) return resolve([])
		      			console.log(formatErrors(filePath, res));
			      	resolve(formatErrors(filePath, res))
		      	})
	      	})
	      })
	    }
	  }
  }
}

function unsafe(fn) {
	return require('loophole').allowUnsafeNewFunction(fn)
}

function getRange (line, col, src, lineStart) {
  line = typeof line !== 'undefined' ? parseInt((line - 1) + lineStart, 10) : 0
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