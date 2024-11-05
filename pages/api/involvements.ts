// pages/api/list.ts
import withCacheAndLimit from "@/lib/cache";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export type InvolvementType =
  | "accused"
  | "victim"
  | "alleged victim"
  | "accusing"
  | "suspected";

export interface Person {
  name: string;
  involvementType: InvolvementType;
  details: string;
  imageUrl: string | null;
}

type Thumbnail = {
  source: string;
  width: number;
  height: number;
};

type WikiImageResponse = {
  batchcomplete: string;
  query: {
    normalized?: Array<{
      from: string;
      to: string;
    }>;
    pages: {
      [key: string]: {
        pageid: number;
        ns: number;
        title: string;
        thumbnail?: Thumbnail;
        pageimage?: string;
      };
    };
  };
};

const WIKI_BASE_URL = "https://en.wikipedia.org/w/api.php";

const involvementData: Omit<Person, "imageUrl">[] = [
  {
    name: "Sean Combs",
    involvementType: "accused",
    details:
      "Facing multiple allegations including sexual assault, sex trafficking, racketeering, and abuse of various individuals over decades.",
  },
  {
    name: "Aaron Hall",
    involvementType: "accused",
    details:
      "Accused by Liza Gardner of coercion into sexual acts alongside Combs in an incident in 1990.",
  },
  {
    name: "Harve Pierre",
    involvementType: "accused",
    details:
      "Named in lawsuits for grooming and alleged involvement in sexual assault and trafficking alongside Combs.",
  },
  {
    name: "Cuba Gooding Jr.",
    involvementType: "accused",
    details:
      "Accused of sexually harassing Rodney Jones Jr., allegedly groomed by Combs to 'pass him off' to Gooding.",
  },
  {
    name: "Justin Dior Combs",
    involvementType: "accused",
    details:
      "Diddy's son, alleged to have solicited sex workers, witnessed abusive incidents, and engaged in incidents involving firearms.",
  },
  {
    name: "Jacob Arabo",
    involvementType: "accused",
    details:
      "Accused by Adria English of non-consensual acts at Combs' parties, allegedly organized by Combs.",
  },
  {
    name: "Yung Miami",
    involvementType: "suspected",
    details:
      "Mentioned as allegedly supplying drugs to Combs and being financially tied to him as part of an alleged trafficking network.",
  },
  {
    name: "Stevie J",
    involvementType: "suspected",
    details:
      "Allegedly recruited sex workers and participated in 'freak-offs' associated with Combs' events.",
  },
  {
    name: "Kalenna Harper",
    involvementType: "victim",
    details:
      "Witnessed abusive behavior by Combs towards other individuals, pressured to work under abusive conditions.",
  },
  {
    name: "Cassie Ventura",
    involvementType: "victim",
    details:
      "Filed a lawsuit accusing Combs of abuse, coercion, and physical violence throughout their relationship.",
  },
  {
    name: "Rachel Kennedy",
    involvementType: "victim",
    details:
      "Accused Combs of controlling behavior and recounted incidents of violence involving him.",
  },
  {
    name: "Jane Doe",
    involvementType: "alleged victim",
    details:
      "Filed a lawsuit claiming she was raped by Combs and another celebrity at age 13 during an MTV after-party.",
  },
  {
    name: "Adria English",
    involvementType: "victim",
    details:
      "Claims she was forced into non-consensual acts at Combs' parties while working as a go-go dancer.",
  },
  {
    name: "Jennifer Lopez",
    involvementType: "suspected",
    details:
      "While not directly implicated, her past relationship with Combs has led to mentions in the scandal.",
  },
  {
    name: "Jimmy Iovine",
    involvementType: "accused",
    details:
      "Allegedly witnessed Combs assault Ventura but did not intervene; connected to Interscope deal with Bad Boy Records.",
  },
  {
    name: "Lucian Grainge",
    involvementType: "accused",
    details:
      "Initially implicated in alleged racketeering with Combs but later dismissed from the case; has denied all involvement.",
  },
  {
    name: "Kim Porter",
    involvementType: "alleged victim",
    details:
      "Diddy's former partner who reportedly endured abusive incidents; later reconciled with him before her death.",
  },
  {
    name: "Rodney Jones Jr.",
    involvementType: "victim",
    details:
      "Alleged that Combs groomed him and exposed him to inappropriate situations with other celebrities.",
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
  const involvementDataWithPics = await Promise.all(
    involvementData.map<Promise<Person>>(async ({ name, ...rest }) => {
      const wikiProfile = await withCacheAndLimit<Partial<Thumbnail>>(
        "profile_pic:" + name.toLowerCase().replace(/s/g, "_"),
        async () => {
          try {
            const response = await axios.get<WikiImageResponse>(
              `${WIKI_BASE_URL}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500`
            );

            const { thumbnail } =
              Object.values(response.data.query.pages)[0] || {};

            return thumbnail || {};
          } catch {
            return {};
          }
        }
      );

      return {
        name,
        imageUrl: wikiProfile.source || null,
        ...rest,
      };
    })
  );

  res.status(200).json(involvementDataWithPics);
}
