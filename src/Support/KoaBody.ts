/**
 * koa-body - index.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * @author  Daryl Lau (@dlau)
 * @author  Charlike Mike Reagent (@tunnckoCore)
 * @author  Hpyer (@hpyer)
 * @api private
 */

'use strict';

/**
 * Module dependencies.
 */

const buddy = require('co-body');
const forms = require('formidable');
const xml2js = require('xml2js');

const jsonTypes = [
  'application/json',
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report'
];

const txtTypes = [
  'text/plain',
  'text/html'
];

const xmlTypes = [
  'text/xml',
  'application/xml'
];

/**
 *
 * @param {Object} options
 * @see https://github.com/dlau/koa-body
 * @api public
 */
export default function requestbody(opts) {
  opts = opts || {};
  opts.onError = 'onError' in opts ? opts.onError : false;
  opts.patchNode = 'patchNode' in opts ? opts.patchNode : false;
  opts.patchKoa = 'patchKoa' in opts ? opts.patchKoa : true;
  opts.multipart = 'multipart' in opts ? opts.multipart : false;
  opts.urlencoded = 'urlencoded' in opts ? opts.urlencoded : true;
  opts.json = 'json' in opts ? opts.json : true;
  opts.text = 'text' in opts ? opts.text : true;
  opts.xml = 'xml' in opts ? opts.xml : true;
  opts.encoding = 'encoding' in opts ? opts.encoding : 'utf-8';
  opts.jsonLimit = 'jsonLimit' in opts ? opts.jsonLimit : '5mb';
  opts.jsonStrict = 'jsonStrict' in opts ? opts.jsonStrict : true;
  opts.formLimit = 'formLimit' in opts ? opts.formLimit : '10mb';
  opts.queryString = 'queryString' in opts ? opts.queryString : null;
  opts.formidable = 'formidable' in opts ? opts.formidable : {};
  opts.includeUnparsed = 'includeUnparsed' in opts ? opts.includeUnparsed : false
  opts.textLimit = 'textLimit' in opts ? opts.textLimit : '5mb';
  opts.xmlLimit = 'xmlLimit' in opts ? opts.xmlLimit : '5mb';

  // @todo: next major version, opts.strict support should be removed
  if (opts.strict && opts.parsedMethods) {
    throw new Error('Cannot use strict and parsedMethods options at the same time.')
  }

  if ('strict' in opts) {
    console.warn('DEPRECATED: opts.strict has been deprecated in favor of opts.parsedMethods.')
    if (opts.strict) {
      opts.parsedMethods = ['POST', 'PUT', 'PATCH']
    } else {
      opts.parsedMethods = ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE']
    }
  }

  opts.parsedMethods = 'parsedMethods' in opts ? opts.parsedMethods : ['POST', 'PUT', 'PATCH']
  opts.parsedMethods = opts.parsedMethods.map(function (method) { return method.toUpperCase() })

  return function (ctx, next) {
    var bodyPromise;
    // only parse the body on specifically chosen methods
    if (opts.parsedMethods.includes(ctx.method.toUpperCase())) {
      try {
        if (opts.json && ctx.is(jsonTypes)) {
          bodyPromise = buddy.json(ctx, {
            encoding: opts.encoding,
            limit: opts.jsonLimit,
            strict: opts.jsonStrict,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.urlencoded && ctx.is('urlencoded')) {
          bodyPromise = buddy.form(ctx, {
            encoding: opts.encoding,
            limit: opts.formLimit,
            queryString: opts.queryString,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.text && ctx.is(txtTypes)) {
          bodyPromise = buddy.text(ctx, {
            encoding: opts.encoding,
            limit: opts.textLimit,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.xml && ctx.is(xmlTypes)) {
          bodyPromise = buddy.text(ctx, {
            encoding: opts.encoding,
            limit: opts.xmlLimit,
            returnRawBody: opts.includeUnparsed
          }).then(async (body) => {
            if (opts.includeUnparsed) {
              body.parsed = await xml2js.parseStringPromise(body.raw);
              body.parsed = singleItem(body.parsed);
            }
            else {
              body = await xml2js.parseStringPromise(body);
              body = singleItem(body);
            }
            return body;
          });
        } else if (opts.multipart && ctx.is('multipart')) {
          bodyPromise = formy(ctx, opts.formidable);
        }
      } catch (parsingError) {
        if (typeof opts.onError === 'function') {
          opts.onError(parsingError, ctx);
        } else {
          throw parsingError;
        }
      }
    }

    bodyPromise = bodyPromise || Promise.resolve({});
    return bodyPromise.catch(function (parsingError) {
      if (typeof opts.onError === 'function') {
        opts.onError(parsingError, ctx);
      } else {
        throw parsingError;
      }
      return next();
    })
      .then(function (body) {
        if (opts.patchNode) {
          if (isMultiPart(ctx, opts)) {
            ctx.req.body = body.fields;
            ctx.req.files = body.files;
            ctx.req.rawBody = null;
          } else if (opts.includeUnparsed) {
            ctx.req.body = body.parsed || {};
            ctx.req.rawBody = body.raw;
          } else {
            ctx.req.body = body;
            ctx.req.rawBody = null;
          }
        }
        if (opts.patchKoa) {
          if (isMultiPart(ctx, opts)) {
            ctx.request.body = body.fields;
            ctx.request.files = body.files;
            ctx.request.rawBody = null;
          } else if (opts.includeUnparsed) {
            ctx.request.body = body.parsed || {};
            ctx.request.rawBody = body.raw;
          } else {
            ctx.request.body = body;
            ctx.request.rawBody = null;
          }
        }
        return next();
      })
  };
}

/**
 * Check if multipart handling is enabled and that this is a multipart request
 *
 * @param  {Object} ctx
 * @param  {Object} opts
 * @return {Boolean} true if request is multipart and being treated as so
 * @api private
 */
function isMultiPart(ctx, opts) {
  return opts.multipart && ctx.is('multipart');
}

/**
 * Donable formidable
 *
 * @param  {Stream} ctx
 * @param  {Object} opts
 * @return {Promise}
 * @api private
 */
function formy(ctx, opts) {
  return new Promise(function (resolve, reject) {
    var fields = {};
    var files = {};
    var form = new forms.IncomingForm(opts);
    form.on('end', function () {
      return resolve({
        fields: fields,
        files: files,
      });
    }).on('error', function (err) {
      return reject(err);
    }).on('field', function (field, value) {
      if (fields[field]) {
        if (Array.isArray(fields[field])) {
          fields[field].push(value);
        } else {
          fields[field] = [fields[field], value];
        }
      } else {
        fields[field] = value;
      }
    }).on('file', function (field, file) {
      if (files[field]) {
        if (Array.isArray(files[field])) {
          files[field].push(file);
        } else {
          files[field] = [files[field], file];
        }
      } else {
        files[field] = file;
      }
    });
    if (opts.onFileBegin) {
      form.on('fileBegin', opts.onFileBegin);
    }
    form.parse(ctx.req);
  });
}

function singleItem(obj) {
  if (typeof obj == 'object') {
    if (typeof obj.length != 'undefined') {
      if (obj.length == 1) {
        return singleItem(obj[0]);
      }
      for (let i = 0; i < obj.length; i++) {
        obj[i] = singleItem(obj[i]);
      }
      return obj;
    }
    else {
      for (let k in obj) {
        obj[k] = singleItem(obj[k]);
      }
    }
  }
  return obj;
};
