import { ObjectId } from "mongodb"
import { getCollection, Collections } from "@/lib/mongodb"

export interface UserDocument {
  _id?: ObjectId
  email: string
  name?: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const collection = await getCollection<UserDocument>(Collections.USERS)
  return collection.findOne({ email })
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const collection = await getCollection<UserDocument>(Collections.USERS)
  if (!ObjectId.isValid(id)) return null
  return collection.findOne({ _id: new ObjectId(id) })
}

interface CreateUserInput {
  email: string
  passwordHash: string
  name?: string
}

export async function createUser(user: CreateUserInput): Promise<UserDocument> {
  const collection = await getCollection<UserDocument>(Collections.USERS)
  const now = new Date().toISOString()
  const doc: UserDocument = {
    ...user,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(doc)
  return {
    ...doc,
    _id: result.insertedId,
  }
}

export async function updateUserPassword(id: ObjectId, passwordHash: string) {
  const collection = await getCollection<UserDocument>(Collections.USERS)
  await collection.updateOne(
    { _id: id },
    {
      $set: {
        passwordHash,
        updatedAt: new Date().toISOString(),
      },
    }
  )
}
