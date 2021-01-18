import { EVENT_MESH_CONFIG, SempConfig } from './event-mesh-nodes-config';
import { PrismaClient } from "@prisma/client";
import axios, { AxiosInstance } from 'axios';
import { SolaceClient, SolaceClientSubscription } from './semp-types';

const prisma = new PrismaClient()

const POLLING_INTERVAL_IN_MS = 5000;

class SempClient {
  nodeName: string;
  api: AxiosInstance;
  vpn: string;

  constructor(sempConfig: SempConfig) {
    this.nodeName = sempConfig.nodeName;
    this.vpn = sempConfig.vpn;
    this.api = axios.create({
      baseURL: `${sempConfig.sempURL}/SEMP/v2/monitor/msgVpns/${sempConfig.vpn}`,
      auth: {
        username: sempConfig.sempUser,
        password: sempConfig.sempPassword
      }
    });
    
  }

}

async function writeToDB(solaceClient: SolaceClient, subscriptionTopics: SolaceClientSubscription[],nodeName:string) {
  
  const topicsToCreateOrUpdate: { create: { subscription: string; }; where: { subscription: string; }; }[] = [];

  subscriptionTopics.forEach((topic) => {
    let prismaObj = {
      create: { subscription: topic.subscriptionTopic }, where: {subscription: topic.subscriptionTopic}
    }
    topicsToCreateOrUpdate.push(prismaObj);
  });
  
  const result = await prisma.eventMeshClients.upsert({
    where: {
        clientName: solaceClient.clientName
    },
    update: {
      subscriptions: {
        // @ts-ignore
        connectOrCreate:  topicsToCreateOrUpdate
      }
    },
    create: {
        clientName: solaceClient.clientName,
        clientAddress: solaceClient.clientAddress,
        nodeName: nodeName,
        userName: solaceClient.clientUsername,
      subscriptions: {
          // @ts-ignore
          connectOrCreate: topicsToCreateOrUpdate
        }
    }
  })

  return result;
}

async function main() {

  let sempClients: SempClient[] = [];

  EVENT_MESH_CONFIG.forEach((config) => {
    let sempClient = new SempClient(config);
    sempClients.push(sempClient);
  });


  setInterval(()=> {
    sempClients.forEach((sempClient: SempClient) => {
      sempClient.api.get('/clients?select=clientName,clientUsername,clientAddress').then((response) => {
        let solaceClients: SolaceClient[] = response.data.data;
        solaceClients.forEach((solaceClient: SolaceClient) => {
          // console.log(solaceClient.clientName);
          sempClient.api.get(`/clients/${encodeURI(solaceClient.clientName).replace(/\#/gi, '%23').replace(/\//gi, '%2F')}/subscriptions?select=subscriptionTopic`).then((response) => {
            writeToDB(solaceClient, response.data.data, sempClient.nodeName).then((prismaResult) => {
              console.dir(`Wrote ${prismaResult.clientName} from ${sempClient.nodeName}...`);
            });
          });
        });
      });
    })}, POLLING_INTERVAL_IN_MS);
    
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })