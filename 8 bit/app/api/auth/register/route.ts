import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, createUser } from "@/lib/users"
import { hashPassword } from "@/lib/password"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "Ya existe una cuenta con este email" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    await createUser({
      email,
      name,
      passwordHash,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "No se pudo crear el usuario" }, { status: 500 })
  }
}
