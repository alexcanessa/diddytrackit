export type NameId = {
  name: string;
  id: string;
};

// Type for an individual artist credit
export type ArtistCredit = {
  name: string;
  artist: NameId;
};

// Type for labels associated with a release
export type Label = NameId;

export type LabelObject = {
  label: Label;
};

// Type for an individual release within a recording response
export type Release = {
  id: string;
  title: string;
  date: string; // Format "YYYY-MM-DD"
  status: string; // e.g., "Official"
  country?: string; // ISO country code, optional
  labels?: LabelObject[];
  "artist-credit"?: ArtistCredit[];
  releases?: Release[];
  disambiguation?: string;
};

export interface Artist {
  id: string;
  name: string;
  "sort-name": string;
  type: string;
  "type-id"?: string;
  disambiguation?: string;
}

export interface Relation {
  artist: Artist;
  type: string;
  "type-id"?: string;
  "target-type"?: string;
  "source-credit"?: string;
  "target-credit"?: string;
  "attribute-values"?: Record<string, unknown>;
  "attribute-ids"?: Record<string, string>;
  attributes?: string[];
  direction?: string;
  begin?: string | null;
  end?: string | null;
  ended?: boolean;
}

// Type for a recording, including artist credits and associated releases
export type Recording = {
  id: string;
  title: string;
  "artist-credit": ArtistCredit[];
  releases: Release[];
  relations?: Relation[]; // Only present if requested with artist-rels
};

// Type for the release details response, including labels
export type ReleaseDetails = {
  "label-info": LabelObject[];
  "artist-credit": ArtistCredit[];
};

export interface Involvement {
  type: string;
  artists: NameId[];
}

export interface TrackDetails {
  title: string;
  artist: NameId;
  features: NameId[];
  producers: NameId[];
  closestReleaseDate: string;
  labels: Label[];
  involvement: Involvement[];
}
