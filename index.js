var _ = require('lodash')
var OrderedList = require('roof-bus/lib/orderedList')
var Router = require('koa-router')
var session = require('koa-session');

var anonymousIndex = -1
function anonymousName(){
  return `anonymous_${++anonymousIndex}`
}

function standardRoute(url) {
  var result = {url: null, method: null}

  if (/^(GET|POST|DELETE|PUT)\s+(\/[\w\*]*|\*)/.test(url)) {
    var urlArray = url.split(/\s+/)
    result.method = urlArray[0].toLowerCase()
    result.url = urlArray[1]

  } else {
    result.method = 'all'
    result.url = url
  }

  return result
}

function isGenerator(fn) {
  return fn.constructor.name === 'GeneratorFunction';
}

function standardHandler(fn, module) {
  var handler = _.defaults(isGenerator(fn) ? {fn: fn} : fn, {
    order: {},
    module: module,
    vendor: fn.module ? module : undefined
  })

  handler.name = `${handler.module}.${handler.name || handler.fn.name || anonymousName()}`

  return handler
}


var request = {
  init: function (app) {
    this.logger = app.logger
    this.log = this.logger.mlog.bind(this.logger, "request")
    this.router = new Router()
    app.use(require('koa-body')())
    app.keys = ['some secret']
    app.use(session(app));
  },
  routes: new OrderedList,
  bootstrap: function (app) {

    //处理所有relier
    _.forEach(this.reliers, function(relier){
      //read route from data
      if( !relier.routes ) return

      _.forEach(relier.routes, function(handler, url){
        this.add( url, handler, relier.name )
      }.bind(this))
    }.bind(this))

    this.routes.forEach( function(route){
      this.log("attaching route", route.url, route.method, route.handler.name)
      this.router[route.method](route.url, route.handler.fn)
    }.bind(this))

    app.use(this.router.routes())
  },
  //API
  add: function (url, handler, moduleName) {
    var route = _.extend(standardRoute(url), {
      handler: standardHandler(handler, moduleName || this.relier)
    })

    this.routes.insert(route.handler.name, route, route.handler.order)
  }
}

module.exports = request