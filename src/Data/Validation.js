const { taggedSum } = require('daggy')
const FL = require('fantasy-land')
const { assign } = Object
const { concat } = require('ramda')

const Validation = taggedSum('Validation', {
    Success: ['value'],
    Failure: ['error']
})

assign(Validation, {
    [FL.of](x){
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

    [FL.map](f){
        return this.cata({
            Success: (value) => Validation.Success(f(value)),
            Failure: () => this
        })
    },

    [FL.ap](validation){
        return this.cata({
            Success: (x) => {
                return validation.cata({
                    Success: (f) => Validation.Success(f(x)),
                    Failure: (error) => Validation.Failure(error)
                })
            },
            Failure: (error) => {
                return validation.cata({
                    Success: () => this,
                    Failure: (otherError) => Validation.Failure(concat(otherError, error))
                })
            }
        })
    },

    [FL.concat](validation) {
        return this.cata({
            Success: (x) => {
                return validation.cata({
                    Success: () => this,
                    Failure: (error) => Validation.Failure(error)
                })
            },
            Failure: (error) => {
                return validation.cata({
                    Success: () => Validation.Failure(error),
                    Failure: (otherError) => Validation.Failure(concat(error, otherError))
                })
            }
        })
    }
})

module.exports = Validation