const { tagged } = require('daggy')
const { map, ap, of, chain } = require('fantasy-land')
const { identity } = require('ramda')
const { assign } = Object


const _tryCatch = (f, reject, resolve) => {
    return (x) => {
        try{ resolve(f(x)) }
        catch(e){ reject(e) }
    }
}

const Task = tagged('Task', ['fork'])

assign(Task, { 
    [of](x){
        return new Task((_, resolve) => resolve(x))
    }
})

assign(Task.prototype, { 
    [map](f){
        return new Task(
            (reject, resolve) =>
                this.fork(reject, _tryCatch(f, reject, resolve))
        )
    },
    [chain](f){
        return new Task((reject, resolve) => {
            this.fork(
                reject,               
                _tryCatch(
                    f, 
                    reject, 
                    (task) => task.fork(
                        reject,
                        _tryCatch(identity, reject, resolve)
                    )
            ))
        })
    },
    [ap](task){
        return this[chain](x => task[map](f => f(x)))
    }
})

module.exports = Task