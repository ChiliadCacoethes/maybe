/**
 * @module              MaybeMonad
 * @description         Creates a safe method to wrap data of unknown type
 * @author              Cacoethes
 * @version             1.4.7
 * @license             MIT
 */
const MaybeMonad = (function () {
  /**
   * Nothing data-type
   * @class Nothing
   */
  const Nothing = (function () {
    /**
     * Nothing data-type
     * @class Nothing
     */
    class Nothing {
      /**
       * Creates a Nothing
       * @public
       * @returns {Just}
       */
      constructor () {
        return this
      }

      /**
       * Returns a wrapped value
       * @public
       * @returns {Nothing}
       */
      unwrap () {
        return this
      }
    }

    return Nothing
  }())

  /**
   * Just data-type
   * @class Just
   */
  const Just = (function () {
    /**
     * internal value symbol
     * @private
     */
    const internal = Symbol('justvalue')

    /**
     * Just data-type
     *
     * @class Maybe
     */
    class Just {
      /**
       * Wraps a value into a Just
       * @public
       * @param {any} value any type to wrap
       * @returns {Just}
       */
      constructor (value) {
        this[internal] = value
        return this
      }

      /**
       * Returns a wrapped value
       * @public
       * @returns {any}
       */
      unwrap () {
        return this[internal]
      }
    }

    return Just
  }())

  /**
   * Maybe data-type
   * @class Maybe
   */
  const Maybe = (function () {
    /**
     * internal value symbol
     * @private
     */
    const internal = Symbol('justornothing')

    /**
     * Checks the nothingness of a passed value
     * @private
     * @param {any} value any value to wrap
     * @returns {boolean}
     */
    const isNothingType = function (value) {
      let nothings = [null, undefined, NaN, [], '']

      return nothings.includes(value)
    }

    /**
     * Checks the justness of any type
     * @private
     * @param {any} value any type to be evaluated
     * @returns {boolean}
     */
    const isJust = function (value) {
      return value instanceof Just
    }

    /**
     * Checks the nothingness of any type
     * @private
     * @param {any} value any type to be evaluated
     * @returns {boolean}
     */
    const isNothing = function (value) {
      return value instanceof Nothing
    }

    /**
     * Checks whether the passed value is already wrapped
     * @private
     * @param {any} value any type to be evaluated
     * @returns {boolean}
     */
    const isWrapped = function (value) {
      return isJust(value) || isNothing(value)
    }

    /**
     * Takes a value and attempts to wrap it into a Just or Nothing
     * @private
     * @param {any} value the value to wrap
     * @returns {Just|Nothing}
     */
    const wrap = function (value) {
      let evaled = typeof value === 'function'
        ? value()
        : value

      return isWrapped(evaled)
        ? evaled
        : isNothingType(evaled)
          ? new Nothing()
          : new Just(evaled)
    }

    /**
     * Maybe data-type
     *
     * @class Maybe
     */
    class Maybe {
      /**
       * Evaluates and attempts to wrap a value into itself
       * @public
       * @param {any} value any type to wrap
       * @returns {Maybe}
       */
      constructor (value) {
        if (value instanceof Maybe) { return value }

        if (this instanceof Maybe) {
          this[internal] = wrap(value)
        } else {
          return new Maybe(value)
        }
      }

      /**
       * Static method of Maybe creation
       * @public
       * @param {value} value any type to wrap into a maybe
       * @returns {Maybe}
       */
      static of (value) {
        return new Maybe(value)
      }

      /**
       * Provides a method to evaluate the Justness of a Maybe and get its value
       * @public
       * @param {function} callback the optional callback for value extraction
       * @returns {boolean|Maybe}
       */
      isJust (callback) {
        const hasCallback = typeof callback === 'function'

        if (isJust(this[internal])) {
          if (hasCallback) {
            callback(this[internal].unwrap())
            return this
          } else {
            return true
          }
        }

        return hasCallback
          ? this
          : false
      }

      /**
       * Provides a method to evaluate the Nothingness of a Maybe
       * @public
       * @param {function} callback the optional callback for error handling
       * @returns {boolean|Maybe}
       */
      isNothing (callback) {
        const hasCallback = typeof callback === 'function'

        if (isNothing(this[internal])) {
          if (hasCallback) {
            callback()
            return this
          } else {
            return true
          }
        }

        return hasCallback
          ? this
          : false
      }
    }

    return Maybe
  }())

  return {
    Maybe: Maybe,
    Just: Just,
    Nothing: Nothing
  }
}())

Object.assign(window, MaybeMonad)
