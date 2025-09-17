import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, Activity, TrendingUp, DollarSign, Zap } from "lucide-react"

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Get system analytics
  const { data: analytics } = await supabase.rpc("get_system_analytics")
  const stats = analytics?.[0] || {}

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentSubscriptions } = await supabase
    .from("subscriptions")
    .select(`
      *,
      profiles (full_name, email),
      subscription_plans (name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor your CTRL SaaS platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_subscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats.total_revenue || 0).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats.tokens_consumed_today || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">AI processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tokens Used This Month</span>
              <span className="font-medium">{Number(stats.tokens_consumed_month || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Files Generated Today</span>
              <span className="font-medium">{stats.files_generated_today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Files Generated This Month</span>
              <span className="font-medium">{stats.files_generated_month || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversion Rate</span>
              <span className="font-medium">
                {stats.total_users > 0
                  ? ((Number(stats.active_subscriptions) / Number(stats.total_users)) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Revenue Per User</span>
              <span className="font-medium">
                $
                {stats.active_subscriptions > 0
                  ? (Number(stats.total_revenue) / Number(stats.active_subscriptions)).toFixed(0)
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent users</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Latest subscription changes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubscriptions && recentSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {recentSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{sub.profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{sub.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"} className="text-xs">
                        {sub.subscription_plans?.name || sub.plan_id}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent subscriptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
