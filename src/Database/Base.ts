import { Connection, ConnectionOptions } from 'mongoose'
import { EventEmitter } from 'events'
import mongoose from 'mongoose'

/**
 * Base db
 * @extends EventEmitter
 */
class Base extends EventEmitter {
    connection!: Connection
    readyAt!: Date | undefined
    /**
     * Instantiates the base database.
     * This class is implemented by the main Database class.
     * @param {string} mongodbURL Mongodb Database URL
     * @param {object} connectionOptions Mongodb connection options
     * @example const db = new Base("mongodb://localhost/mydb");
     */
    constructor(public dbURL: string, public options: ConnectionOptions = {}) {
        super()
        /**
         * Returns mongodb connection
         * @type {MongooseConnection}
         */
        this.connection = this._create(this.dbURL)

        // Emitting Events on Connection ERROR and OPEN
        this.connection.on('error', (e: Error) => this.emit('error', e))
        this.connection.on('open', () => {
            /**
             * Timestamp when database became ready
             * @name Base#readyAt
             * @type {Date}
             */
            this.readyAt = new Date()
            this.emit('ready')
        })
    }

    /**
     * Creates database connection
     * @param {string} [url=this.dbURL] Database url
     * @returns {MongooseConnection}
     */
    _create = (url: string): Connection => {
        this.emit('debug', 'Creating database connection...')

        if ('useUnique' in this.options) delete (this.options as { useUnique?: boolean })['useUnique']

        return mongoose.createConnection(url ?? this.dbURL, {
            ...this.options,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    }

    /**
     * Destroys database
     * @private
     */
    _destroyDatabase = (): void => {
        this.connection.close(true)
        this.readyAt = undefined
        this.dbURL = ''
        this.emit('debug', 'Database connection ended.')
    }

    /**
     * Current database url
     * @type {string}
     */
    get url(): string {
        return this.dbURL
    }

    /**
     * Returns database connection state
     * @type {("DISCONNECTED"|"CONNECTED"|"CONNECTING"|"DISCONNECTING")}
     */
    get state(): string {
        if (!this.connection || typeof this.connection.readyState !== 'number') return 'DISCONNECTED'
        switch (this.connection.readyState) {
            case 0:
                return 'DISCONNECTED'
            case 1:
                return 'CONNECTED'
            case 2:
                return 'CONNECTING'
            case 3:
                return 'DISCONNECTING'
            default:
                return 'DISCONNECTED'
        }
    }
}

export default Base
