/**
* @module              MaybeUtil
* @description         Includes methods for working with Maybes
* @author              Cacoethes
* @version             1.4.7
* @license             MIT
*/
/* global define */
define('cacoethes/maybe-util', ['cacoethes/maybe'], function (Maybe) {
  /**
   * Collection data-type
   * @class Collection
   */
  var Collection = (function () {
    /**
     * internal value symbol
     * @private
     */
    var collection = Symbol('internalCollection')

    /**
     * Creates a collection that we can use to digest Maybes
     * @public
     * @returns {Collection}
     */
    var Collector = function () {
      this[collection] = []
      return this
    }

    /**
     * Adds a value to the collection
     * @param {any} value adds a value to the collection
     */
    Collector.prototype.mport = function (value) {
      this[collection].push(value)
    }

    /**
     * Returns a plain-type array or null
     * @returns {array|null}
     */
    Collector.prototype.xport = function () {
      return this[collection].length > 0
        ? this[collection]
        : null
    }

    return Collector
  }())

  /**
   * Iterates over an array and calls the callback
   * @param {Array} maybes an array of maybes to iterate over
   * @param {function} callback a function to call on each item
   */
  var meach = function (maybes, callback) {
    var values = Maybe.of(maybes)

    values.isJust(function (list) {
      if (!Array.isArray(list)) {
        list = [list]
      }

      list.forEach(function (maybe) {
        callback(Maybe.of(maybe))
      })
    })
  }

  /**
   * Maps a function to maybes
   * @param {Array} maybes an array of maybes to map
   * @param {functio} callback a function to apply a maybe value to
   */
  var mapply = function (maybes, callback) {
    var collection = new Collection()

    meach(maybes, function (maybe) {
      maybe
        .isJust(function (value) {
          var result = callback(value)

          collection.mport(Maybe.of(result))
        })
        .isNothing(function () {
          collection.mport(Maybe.of(null))
        })
    })

    return Maybe.of(collection.xport())
  }

  /**
   * Collect a single or an array of maybes into an array or single
   * @param {Maybe} maybes the maybe to collect
   * @returns {null|array|any}
   */
  var collect = function (maybes) {
    var collection = new Collection()

    if (maybes instanceof Maybe) {
      maybes
        .isJust(function (list) {
          meach(list, function (maybe) {
            maybe
              .isJust(function (value) {
                collection.mport(value)
              })
          })
        })

      collection = collection.xport()

      return !collection
        ? null
        : collection.length > 1
          ? collection
          : collection[0]
    }

    return null
  }

  return {
    meach: meach,
    mapply: mapply,
    unsafe: {
      collect: collect
    }
  }
})
