const { Success, Failure } = require('./src/Data/Validation')
const { 
    curry, 
    propSatisfies, 
    gte, 
    test, 
    any, 
    equals, 
    not, 
    compose, 
    lift, 
    applyTo,
    useWith,
    concat,
    identity,
    invoker,
    chain,
    always
} = require('ramda')

const fold = invoker(2, 'fold')

const { getLine, foldMap, unlines, putStrLn } = require('./src/util')

// --Types

const User = (name, password) => ({ name, password })
const ValidationError = (error) => [error] // instance of semigroup

// --Predicates

// hasMaxLength :: Int -> String -> Bool 
const hasMaxLength = curry((n, s) => propSatisfies(gte(n), 'length', s))

// isAlphaNumeric :: String -> Bool
const isAlphaNumeric = test(/^[a-z0-9]+$/i)

// hasSpace :: String -> Bool
const hasSpace = any(equals(' '))

// --Util Validation

// toValidation :: (a -> Bool) -> ValidationError -> a -> Validation ValidationError a
const toValidation = curry((predicate, validationError, x) => {
    return predicate(x) ? Success(x) : Failure(validationError)
})

// --Validations

// validateHasSpace :: Sting -> Validation ValidationError String
const validateHasSpace = toValidation(
    compose(not, hasSpace),
    ValidationError('It does not have to contain spaces')
)

// validateMaxLengthTo5 :: Sting -> Validation ValidationError String
const validateMaxLengthTo5 = toValidation(
    hasMaxLength(5),
    ValidationError('The maximum size must be 5')
)

// validateAlphanumeric :: Sting -> Validation ValidationError String
const validateAlphanumeric = toValidation(
    isAlphaNumeric,
    ValidationError('Only alphanumeric characters are allowed')
)
 
// validateUsername :: String -> Validation ValidationError String
const validateUsername = (username) => foldMap(applyTo(username), [validateHasSpace, validateAlphanumeric])

// validatePassword :: String -> Validation ValidationError String
const validatePassword = (password) => foldMap(applyTo(password), [validateHasSpace, validateAlphanumeric, validateMaxLengthTo5 ])

// identifyLabel :: String -> (a -> Validation ValidationError a) -> Validation ValidationError a
const identifyLabel = curry((message, validation, x) => {
    return validation(x).cata({
        Success: (value) => Success(value),
        Failure: (error) => Failure(concat(ValidationError(message), error)) 
    })
}) 

// validateCredentials :: String -> String -> Validation ValidationError User
const validateCredentials = useWith(lift(User), [
    identifyLabel('Username Errors:', validateUsername), 
    identifyLabel('Password Errors:', validatePassword),
])

// display :: Validation ValidationError User -> Task Error undefined
const display = fold(
    compose(putStrLn, unlines),
    compose(putStrLn, ({ name }) => `Welcome ${name}!`)
)

// validateCredentialsFromTerminal :: Task Error String -> Task Error String -> Task Validation ValidationError User
const validateCredentialsFromTerminal = lift(validateCredentials)


const main = compose(
    chain(display),
    () => validateCredentialsFromTerminal(
        getLine('Please enter your user name:'),
        getLine('Please enter your password:')
    )
)

// -- Run
main().fork(identity, identity)