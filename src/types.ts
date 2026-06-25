export interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface PlaylistData {
  channels: IPTVChannel[];
  groups: string[];
}
