/**
* @module              MaybeMonad
* @description         Creates a safe method to wrap data of unknown type
* @author              Cacoethes
* @version             1.4.7
* @license             MIT
*/
/* global define */
define('cacoethes/maybe', [], function () {
  var Nothing = (function () {
    var Nothing = function () {
      return this
    }

    Nothing.prototype.unwrap = function () {
      return this
    }

    return Nothing
  }())

  var Just = (function () {
    var internal = Symbol('justvalue')

    var Just = function (value) {
      this[internal] = value
      return this
    }

    Just.prototype.unwrap = function () {
      return this[internal]
    }

    return Just
  }())

  var Maybe = (function () {
    var internal = Symbol('justornothing')

    var noop = function () {}

    var hasCallback = function (cb, succ, err) {
      if (typeof cb === 'function') {
        return succ(cb)
      } else {
        return err()
      }
    }

    var toArray = function (value) {
      if (!Array.isArray(value)) {
        return [value]
      }

      return value
    }

    var isNothingType = function (value) {
      var nothings = [null, undefined, NaN, '']

      return nothings.includes(value) ||
        (
          (Array.isArray(value)) &&
              (value.length === 0)
        )
    }

    var isJust = function (value) {
      return value instanceof Just
    }

    var isNothing = function (value) {
      return value instanceof Nothing
    }

    var isWrapped = function (value) {
      return isJust(value) || isNothing(value)
    }

    var wrap = function (value) {
      var evaled = typeof value === 'function'
        ? value()
        : value

      return isWrapped(evaled)
        ? evaled
        : isNothingType(evaled)
          ? new Nothing()
          : new Just(evaled)
    }

    var evaluateChild = function (looking, value, callback) {
      var truthy = false
      var val = value[internal]

      switch (looking) {
        case 'just':
          truthy = isJust(val)
          break
        case 'nothing':
          truthy = isNothing(val)
          break
      }

      if (truthy) {
        return hasCallback(callback, function (callback) {
          callback(val.unwrap())
          return value
        }, function () {
          return true
        })
      }

      return typeof callback === 'function'
        ? value
        : false
    }

    var Maybe = function (value) {
      if (value instanceof Maybe) { return value }

      if (this instanceof Maybe) {
        this[internal] = wrap(value)
      } else {
        return new Maybe(value)
      }
    }

    Maybe.of = function (value) {
      return new Maybe(value)
    }

    Maybe.prototype.unsafeExport = function (caller) {
      if (caller instanceof Maybe) {
        return this[internal].unwrap()
      }

      return Maybe.of(null)
    }

    Maybe.prototype.isJust = function (callback) {
      return evaluateChild('just', this, callback)
    }

    Maybe.prototype.isNothing = function (callback) {
      return evaluateChild('nothing', this, callback)
    }

    Maybe.prototype.forEach = function (callback) {
      var value = toArray(this[internal].unwrap())

      value.forEach(function (el, i, arr) {
        hasCallback(callback, function (callback) {
          callback(el, i, arr)
        }, noop)
      })

      return this
    }

    Maybe.prototype.map = function (callback) {
      var value = toArray(this[internal].unwrap())
      var maybes

      maybes = value.map(function (el, i, arr) {
        var val

        if (el instanceof Maybe) {
          val = el.unsafeExport(this)

          if (isJust(val)) {
            val = val.unwrap()
          }
        } else {
          val = el
        }

        if (!(val instanceof Nothing)) {
          val = hasCallback(callback, function (callback) {
            return callback(val, i, arr)
          }, function () {
            return val
          })
        }

        return Maybe.of(val)
      }.bind(this))

      return Maybe.of(maybes)
    }

    return Maybe
  }())

  return Maybe
})
