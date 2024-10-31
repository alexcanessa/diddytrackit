export type NameId = {
  name: string;
  id: string;
}

// Type for an individual artist credit
export type ArtistCredit = {
  name: string;
  artist:NameId
};

// Type for a producer in the recording relations
export type ProducerRelation = {
  type: 'producer';
  artist: NameId
};

// Type for labels associated with a release
export type Label = NameId

export type LabelObject = {
  label: Label;
};

// Type for an individual release within a recording response
export type Release = {
  id: string;
  date: string; // Format "YYYY-MM-DD"
  status: string; // e.g., "Official"
  country?: string; // ISO country code, optional
  labels?: LabelObject[];
};

// Type for a recording, including artist credits and associated releases
export type Recording = {
  id: string;
  title: string;
  'artist-credit': ArtistCredit[];
  releases: Release[];
  relations?: ProducerRelation[]; // Only present if requested with artist-rels
};

// Type for the release details response, including labels
export type ReleaseDetails = {
  "label-info": LabelObject[];
  "artist-credit": ArtistCredit[];
};

// Type for the output of the main function with complete track details
export type TrackDetails = {
  title: string;
  artist: NameId;
  features: NameId[];
  closestReleaseDate: string;
  labels: Label[];
  producers: ProducerRelation["artist"][];
};
