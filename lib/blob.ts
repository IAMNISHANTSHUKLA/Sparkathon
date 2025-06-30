import { put, list, del } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadFile(file: File, folder = "") {
  try {
    const filename = `${folder ? `${folder}/` : ""}${nanoid()}-${file.name}`
    const { url } = await put(filename, file, {
      access: "public",
    })

    return { url, filename }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function listFiles(prefix = "") {
  try {
    const { blobs } = await list({ prefix })
    return blobs
  } catch (error) {
    console.error("Error listing files:", error)
    throw error
  }
}

export async function deleteFile(url: string) {
  try {
    await del(url)
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
