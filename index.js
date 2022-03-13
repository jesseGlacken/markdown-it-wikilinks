'use strict'

const Plugin = require('markdown-it-regexp')
const extend = require('extend')
const sanitize = require('sanitize-filename')

module.exports = (options) => {

  const defaults = {
    baseURL: '/',
    relativeBaseURL: './',
    makeAllLinksAbsolute: false,
    regex:  /^\[{2}([^|\]\n]+)(\|([^\]\n]+))?\]{2}$/,
    uriSuffix: '',
    htmlAttributes: {
    },
    postProcessPageName: (pageName) => {
      pageName = pageName.trim()
      pageName = pageName.split('/').map(sanitize).join('/')
      pageName = pageName.replace(/\s+/, '_')
      return pageName
    },
    postProcessLabel: (label) => {
      label = label.trim()
      return label
    }
  }

  options = extend(true, defaults, options)

  function isAbsolute(pageName) {
    return options.makeAllLinksAbsolute || pageName.charCodeAt(0) === 0x2F /* / */
  }

  function removeInitialSlashes(str) {
    return str.replace(/^\/+/g, '')
  }

  function getLabel(options, match) {
    return options.postProcessLabel(
      !!match[3] ? match [3] : match[1]
    );
  }

  function getPageName(options, match, label) {
    return options.postProcessPageName(
      !!match[3] ? match[1] : label
    );
  }

  function formatHref(options, pageName, utils) {
    const prefix = isAbsolute(pageName) ? options.baseURL : options.relativeBaseURL;
    const suffix = options.uriSuffix;
    return utils.escape(`${prefix}${removeInitialSlashes(pageName)}${suffix}`);
  }

  return Plugin(
   options.regex,
    (match, utils) => {
      const label = getLabel(options, match);
      const pageName = getPageName(options, match, label);
      if (!label || !pageName) {
        return match.input
      };

      const htmlAttrsString = [
        `href="${formatHref(options, pageName, utils)}"`,
        ...Object.keys(options.htmlAttributes).map(attr => `${attr}="${options.htmlAttributes[attr]}"`)
      ].join(' ');

      return `<a ${htmlAttrsString}>${label}</a>`
    }
  )
}
