import {
  intArg,
  makeSchema,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'


const EventMeshClients = objectType({
  name: 'EventMeshClients',
  definition(t) {
    t.model.clientName()
    t.model.clientAddress()
    t.model.nodeName()
    t.model.userName()
    t.model.createdAt()
    t.model.lastUpdated()
    t.model.subscriptions({
      pagination: false,
    })
  },
});

const EventMeshSubscriptions = objectType({
  name: 'EventMeshSubscriptions',
  definition(t) {
    t.model.subscription()
    t.model.lastUpdated()
    t.model.clients({
      pagination:false,
    })
  }
});


const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.eventMeshClients();

   
    t.list.field('findClientsForSubscription', {
      type: 'EventMeshSubscriptions',
      args: {
        topicString: nullable(stringArg()),
      },
      resolve: (_, { topicString }, ctx) => {
        return ctx.prisma.eventMeshSubscriptions.findMany({
          where: {
            OR: [
              { subscription: { contains: topicString } },
            ],
          },
        });
      },
    });
  }
});


export const schema = makeSchema({
  types: [Query, EventMeshClients, EventMeshSubscriptions],
  plugins: [nexusPrisma({ experimentalCRUD: true })],
  outputs: {
    schema: __dirname + '/schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
