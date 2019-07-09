const map = require('map-stream');
const rext = require('replace-ext');
const log = require('fancy-log');
const PluginError = require('plugin-error');

const PLUGIN_NAME = 'gulp-twigjs';

const twig = require('twig');

twig.twig;

module.exports = function(options, twig) {
  'use strict';
  options = Object.assign(
    {},
    {
      changeExt: true,
      extname: '.html',
      useFileContents: false,
    },
    options || {},
  );

  function modifyContents(file, cb) {
    var data = file.data || Object.assign({}, options.data);

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported!'));
    }

    if (typeof twig === 'Template') {
      return cb(new PluginError(PLUGIN_NAME, 'is not Template type'));
    }

    data._file = file;
    if (options.changeExt === false || options.extname === true) {
      data._target = {
        path: file.path,
        relative: file.relative,
      };
    } else {
      data._target = {
        path: rext(file.path, options.extname || ''),
        relative: rext(file.relative, options.extname || ''),
      };
    }

    try {
      file.contents = new Buffer(twig.render(data));
    } catch (e) {
      if (options.errorLogToConsole) {
        log(PLUGIN_NAME + ' ' + e);
        return cb();
      }

      if (typeof options.onError === 'function') {
        options.onError(e);
        return cb();
      }
      return cb(new PluginError(PLUGIN_NAME, e));
    }

    file.path = data._target.path;
    cb(null, file);
  }

  return map(modifyContents);
};
