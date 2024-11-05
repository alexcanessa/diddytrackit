// pages/api/list.ts
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
const WIKI_BASE_URL = "https://en.wikipedia.org/w/api.php";

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
  query: {
    pages: {
      [key: string]: {
        thumbnail?: Thumbnail;
      };
    };
  };
};

// Helper function to fetch image from Wikipedia API
const fetchWikiImage = async (name: string): Promise<string | null> => {
  try {
    const response = await axios.get<WikiImageResponse>(
      `${WIKI_BASE_URL}?action=query&titles=${encodeURIComponent(
        name
      )}&prop=pageimages&format=json&pithumbsize=500`
    );
    const { thumbnail } = Object.values(response.data.query.pages)[0] || {};
    return thumbnail?.source || null;
  } catch {
    return null;
  }
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const people = await prisma.person.findMany();

    const sortedPeople = [...people].sort((a, b) => {
      if (a.name === "Sean Combs") return -1;
      if (b.name === "Sean Combs") return 1;

      return a.name.localeCompare(b.name);
    });

    res.status(200).json(sortedPeople);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve data" });
  }
};

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, involvementType, details } = req.body;

  if (!name || !involvementType || !details) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    let person = await prisma.person.findFirst({
      where: { name },
    });

    if (person) {
      return res.status(409).json({ error: "Person already exists" });
    }

    const imageUrl = await fetchWikiImage(name);
    person = await prisma.person.create({
      data: {
        name,
        involvementType,
        details,
        imageUrl,
      },
    });

    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ error: "Failed to create person" });
  }
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, name, involvementType, details } = req.body;

  if (!id || !name || !involvementType || !details) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    let person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      res.status(404).json({ error: "Person not found" });
      return;
    }

    const imageUrl = person.imageUrl || (await fetchWikiImage(name));

    person = await prisma.person.update({
      where: { id },
      data: { name, involvementType, details, imageUrl },
    });

    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ error: "Failed to update person" });
  }
};

const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    await prisma.person.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete person" });
  }
};

// Method handlers mapped to HTTP methods
const methodHandlers: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: getHandler,
  POST: postHandler,
  PUT: putHandler,
  DELETE: deleteHandler,
};

// Main handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const methodHandler = methodHandlers[req.method || ""];

  if (!methodHandler) {
    res.setHeader("Allow", Object.keys(methodHandlers));
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await methodHandler(req, res);
}
