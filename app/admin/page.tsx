import { requireAdmin } from "@/lib/auth/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, Activity, FileAudio, Mic } from "lucide-react"
import AdminStatsCards from "@/components/admin/admin-stats-cards"
import AdminChart from "@/components/admin/admin-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Mic className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">AAS</span>
              </Link>
              <span className="text-muted-foreground">/ Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/users">
                <Button variant="outline">Manage Users</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
              <Badge variant="destructive">Admin Access</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <AdminStatsCards />

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AdminChart />

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Subscription upgrade to Pro</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">High API usage detected</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">System maintenance completed</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and edit user accounts</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Subscriptions</h3>
              <p className="text-sm text-muted-foreground">Monitor billing and plans</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">Usage and performance metrics</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileAudio className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Content</h3>
              <p className="text-sm text-muted-foreground">Moderate audio files</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
