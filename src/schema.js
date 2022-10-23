const { gql } = require('apollo-server')
const { prisma } = require('./db')
const { sendCode } = require('./sms')
const { v4: uuidv4 } = require('uuid')
const { GraphQLError } = require('graphql')
const { verify, sign } = require('jsonwebtoken')

const typeDefs = gql`
  type Token {
    token: String!
  }

  type Query {
    authenticated(token: String!): Token
  }

  type Mutation {
    login(phone: String!): Boolean
    auth(phone: String!, code: String!): Token
  }
`

const resolvers = {
    Query: {
        authenticated: (_, args) => {
            return prisma.token.findUnique({
                where: {
                    token: args.token
                }
            }).then((token) => {
                if (!token) {
                    throw new GraphQLError('You are not authorized', {
                        extensions: {
                            code: 'UNAUTHORIZED',
                        },
                    });
                }
                const verified = verify(token.token, process.env.JWT_SECRET);
                if (!verified) {
                    throw new GraphQLError('You are not authorized', {
                        extensions: {
                            code: 'UNAUTHORIZED',
                        },
                    });
                }
                return token;
            });
        }
    },
    Mutation: {
        login: (_, args) => {
            return sendCode(args.phone)
                .then((code) => prisma.code.create({
                    data: {
                        code: code,
                        phone: args.phone,
                        time: new Date()
                    }
                }))
                .then(() => true);
        },
        auth: (_, args) => {
            return prisma.code.findUnique({
                where: {
                    phone: args.phone
                }
            }).then((code) => {
                if (!code || code.code != args.code) {
                    throw new GraphQLError('You are not authorized', {
                        extensions: {
                            code: 'UNAUTHORIZED',
                        },
                    });
                }
                return code;
            }).then(() => prisma.code.delete({
                where: {
                    phone: args.phone
                }
            })).then(() => prisma.user.findUnique({
                where: {
                    phone: args.phone
                }
            })).then((user) => {
                if (!user) {
                    return prisma.user.create({
                        data: {
                            phone: args.phone,
                            id: uuidv4()
                        }
                    })
                }
                return user;
            }).then((user) => {
                const token = sign({
                    user: user.id
                }, process.env.JWT_SECRET);
                return prisma.token.create({
                    data: {
                        token: token
                    }
                });
            })
        }
    }
}


module.exports = {
    resolvers,
    typeDefs,
}