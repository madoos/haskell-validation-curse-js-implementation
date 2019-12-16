const { EOL } = require('os')
const { createInterface } = require('readline')
const { curry, concat, join } = require('ramda')
const Task = require('./Data/Task')

const redLine = createInterface({ 
    input: process.stdin, 
    output: process.stdout,  
    removeHistoryDuplicates: true,
    historySize: 0
})

// putStrLn :: String -> Promise e undefined
const putStrLn = (str) => Task((_, resolve) => resolve(process.stdout.write(`${str}${EOL}`)))

// getLine :: String -> Task e String
const getLine = (s) => Task((_, resolve) => redLine.question(`${s}${EOL}`, resolve))

// foldMap :: (a -> b) -> [a] -> b
const foldMap = curry((f, xs) => xs.map(f).reduce(concat))
 
// unlines :: [String] -> String
const unlines = join(EOL)

module.exports = {
    putStrLn,
    getLine,
    foldMap,
    unlines
}