export const EVENT_MESH_CONFIG: SempConfig[] =
  [
    {
      nodeName: "Node1",
      sempURL: "", //"https://host:port"
      vpn: "",
      sempUser: "",
      sempPassword: ""
    }
  ];

export class SempConfig {
  nodeName: string;
  sempURL: string;
  vpn: string;
  sempUser: string;
  sempPassword: string;

  constructor(nodeName: string, sempURL: string, vpn: string, sempUser: string, sempPassword: string) {
    this.nodeName = nodeName;
    this.sempURL = sempURL;
    this.vpn = vpn;
    this.sempUser = sempUser;
    this.sempPassword = sempPassword;
  }
}