const { ApolloServer } = require('apollo-server')
const { resolvers, typeDefs } = require('./schema')

const port = process.env.PORT || 7389

new ApolloServer({ resolvers, typeDefs }).listen({ port }, () =>
    console.log(`Server ready at: http://localhost:${port}`),
)
