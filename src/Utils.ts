/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
export default class Utils {
    /**
     * Checks if provided key is valid
     * @param {unknown} str Anything to test
     * @returns {boolean}
     */
    static isKey = (str: unknown): boolean => {
        return typeof str === 'string'
    }

    /**
     * Returns true if the given data is valid
     * @param {any} data Any data
     * @returns {boolean}
     */
    static isValue = (data: unknown): boolean => {
        if (data === Infinity || data === -Infinity) return false
        if (typeof data === 'undefined') return false
        return true
    }

    /**
     * @typedef {object} KEY
     * @property {string | undefined} key Parsed Key
     * @property {string | undefined} target Parsed target
     */

    /**
     * Returns target & key from the given string (quickdb style)
     * @param {string} key key to parse
     * @returns {KEY}
     */
    static parseKey = (key?: string): {
        key?: string
        target?: string
    } => {
        if (typeof key !== 'string') return { key: undefined, target: undefined }

        const [parsed, ...targets] = key.split('.')
        return { key: parsed, target: targets.length ? targets.join('.') : undefined }
    }

    /**
     * Sort data
     * @param {string} key Key
     * @param {Array} data Data
     * @param {object} ops options
     * @returns {any[]}
     */
    static sort = <T extends { ID: string }>(key: string, data: T[], ops: Record<string, any>): T[] => {
        if (!key || !data || !Array.isArray(data)) return []
        let arb = data.filter((i) => i.ID.startsWith(key))
        if (ops && ops.sort && typeof ops.sort === 'string') {
            if (ops.sort.startsWith('.')) ops.sort = ops.sort.slice(1)
            ops.sort = ops.sort.split('.')
            arb = _.sortBy(arb, ops.sort).reverse()
        }
        return arb
    }

    /**
     * Data resolver
     * @param {string} key Data key
     * @param {any} data Data
     * @param {any} value value
     * @returns {any}
     */
    static setData = (key: string, data: Record<string, unknown>, value: unknown): any => {
        const parsed = this.parseKey(key)

        if (parsed.target) {
            if (typeof data !== 'object') throw new Error('Cannot target non-object.')
            data = _.set(data, parsed.target, value)
        }

        return data
    }

    /**
     * Data resolver
     * @param {string} key Data key
     * @param {any} data Data
     * @param {any} value value
     * @returns {any}
     */
    static unsetData = <T>(key: string, data: T): T => {
        const parsed = this.parseKey(key)
        const item = data
        if (typeof data === 'object' && parsed.target) _.unset(item, parsed.target)
        else if (parsed.target) throw new Error('Cannot target non-object.')
        return item
    }

    /**
     * Data resolver
     * @param {string} key Key
     * @param {object} data Data
     * @returns {any}
     */
    static getData = <T>(key: string, data: T): T => {
        const parsed = this.parseKey(key)
        if (parsed.target) data = _.get(data, parsed.target)
        return data
    }
}
