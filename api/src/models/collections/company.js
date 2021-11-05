const { model } = require('mongoose');
var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;
var ObjectIdSchema = Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

const companySchema = new Schema({

    _id: {
        type: String,
        required: true
    },
    
    idMongo: {
        type: ObjectIdSchema,
        default: new ObjectId()
    },

    name: {
        type: String,
        required: true
    },

    webpage: {
        type: String,
        required: false
    },

    gmail: {
        type: String,
        required: true,
        unique: true
    },

    photograph: {
        type: String,
        required: false
    },

    country: {
        type: String,
        required: false
    },

    state: {
        type: String,
        required: false
    },
    
    city: {
        type: String,
        required: false
    },

    premium: {
        type: Boolean,
        default: false
    },

    description: {
        type: String,
        required: false,
        maxLength: 500
    },

    publications: [{
        type: Schema.Types.ObjectId,
        ref: 'publication',
        // autopopulate: true
    }],

    jobs: [{
        type: Schema.Types.ObjectId,
        ref: 'jobs',
        autopopulate: true
    }]
})

companySchema.plugin(mongoosePaginate);
// companySchema.plugin(require('mongoose-autopopulate'));

module.exports = model('company', companySchema)