import { requireAdmin } from "@/lib/auth/admin"
import UserManagement from "@/components/admin/user-management"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"

export default async function AdminUsersPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <Mic className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">AAS</span>
              </Link>
              <span className="text-muted-foreground">/ Admin / Users</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">Admin Dashboard</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage user accounts and permissions</p>
        </div>

        <UserManagement />
      </div>
    </div>
  )
}
