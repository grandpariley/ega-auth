const { gql } = require('apollo-server')
const { prisma } = require('./db')
const { GraphQLError } = require('graphql')

const typeDefs = gql`
  type Token {
    token: String!
  }

  type PendingLogin {
  }

  type Query {
    authenticated(token: String!): Token
  }

  type Mutation {
    login(phone: String!): PendingLogin
    auth(phone: String!, code: String!): Token
  }
`

const resolvers = {
    Query: {
        authenticated: (_, args) => {
            token = prisma.token.findOne({
                where: {
                    token: args.token
                }
            });
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            if (verified) {
                return token;
            }
            throw new GraphQLError('You are not authorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                },
            });
        }
    },
    Mutation: {
        create: (_, args) => {
            code = sendCode(args.phone)
            prisma.code.create({
                code: code,
                phone: args.phone,
                time: new Date()
            });
            return {};
        },
        auth: (_, args) => {
            code = prisma.code.findOne({
                where: {
                    code: args.code,
                    phone: args.phone
                }
            });
            if (!code) {
                throw new GraphQLError('You are not authorized', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                    },
                });
            }
            prisma.code.delete({
                where: {
                    code: args.code,
                    phone: args.phone
                }
            });
            user = prisma.user.findOne({
                where: {
                    phone: args.phone
                }
            });
            const token = jwt.sign({
                user: user.id
            }, process.env.JWT_SECRET);
            return prisma.token.create({
                token: token
            });
        }
    }
}


module.exports = {
    resolvers,
    typeDefs,
}