const { taggedSum } = require('daggy')
const { map, ap, chain, of } = require('fantasy-land')
const { assign } = Object
const { concat } = require('ramda')

const Validation = taggedSum('Validation', {
    Success: ['value'],
    Failure: ['error']
})

assign(Validation, {
    [of](x){
        return Validation.Success(x)
    },

    fail(error){
        return Validation.Failure(error)
    }
})

assign(Validation.prototype, {
    fold(l,r){
        return this.cata({
            Failure: l,
            Success: r
        })
    },

    [map](f){
        return this.cata({
            Success: (value) => Validation.Success(f(value)),
            Failure: () => this
        })
    },

    [ap](validation){
        return this.cata({
            Success: (x) => {
                return validation.cata({
                    Success: (f) => Validation.Success(f(x)),
                    Failure: (error) => Validation.Failure(error)
                })
            },
            Failure: (error) => {
                return validation.cata({
                    Success: (f) => this,
                    Failure: (otherError) => Validation.Failure(concat(otherError, error))
                })
            }
        })
    }
})

module.exports = Validation