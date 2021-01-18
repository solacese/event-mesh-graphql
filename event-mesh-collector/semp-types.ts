export class SolaceClient {
  clientAddress: string;
  clientName: string;
  clientUsername: string;

  constructor(clientAddress: string, clientName: string, clientUsername: string) {
    this.clientAddress = clientAddress;
    this.clientName = clientName;
    this.clientUsername = clientUsername;
  }
}

export class SolaceClientSubscription {
  subscriptionTopic: string;

  constructor(subscriptionTopic: string) {
    this.subscriptionTopic = subscriptionTopic;
  }
}