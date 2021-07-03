import { Connection, Model, Schema } from 'mongoose'

export interface ISchema {
    ID: string
    data: unknown
}

const Default = new Schema<ISchema>(
    {
        ID: {
            type: String,
            required: true,
            unique: true
        },
        data: {
            type: Schema.Types.Mixed,
            required: true
        }
    },
    { versionKey: false, id: false }
)

export default (connection: Connection, name: string): Model<ISchema> =>
    typeof name === 'string' ? connection.model(name, Default) : connection.model('JSON', Default)
