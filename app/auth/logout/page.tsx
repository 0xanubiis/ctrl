import { signOut } from "@/lib/actions/auth"
import { redirect } from "next/navigation"

export default async function LogoutPage() {
  await signOut()
  redirect("/auth/login")
}
