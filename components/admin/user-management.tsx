"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, User, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: "user" | "admin"
  created_at: string
  subscriptions: Array<{
    tier: string
    status: string
    current_period_end: string | null
  }>
}

interface UserManagementState {
  users: UserProfile[]
  loading: boolean
  search: string
  roleFilter: string
  page: number
  totalPages: number
  selectedUser: UserProfile | null
  editDialogOpen: boolean
}

export default function UserManagement() {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: true,
    search: "",
    roleFilter: "all", // Updated default value to "all"
    page: 1,
    totalPages: 1,
    selectedUser: null,
    editDialogOpen: false,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [state.page, state.search, state.roleFilter])

  const loadUsers = async () => {
    setState((prev) => ({ ...prev, loading: true }))

    try {
      const params = new URLSearchParams({
        page: state.page.toString(),
        limit: "20",
        ...(state.search && { search: state.search }),
        ...(state.roleFilter !== "all" && { role: state.roleFilter }), // Updated condition to exclude "all" from params
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setState((prev) => ({
          ...prev,
          users: data.users,
          totalPages: data.pagination.pages,
        }))
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleSearch = (value: string) => {
    setState((prev) => ({ ...prev, search: value, page: 1 }))
  }

  const handleRoleFilter = (value: string) => {
    setState((prev) => ({ ...prev, roleFilter: value, page: 1 }))
  }

  const handleEditUser = (user: UserProfile) => {
    setState((prev) => ({ ...prev, selectedUser: user, editDialogOpen: true }))
  }

  const handleUpdateUser = async (updates: Partial<UserProfile>) => {
    if (!state.selectedUser) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: state.selectedUser.id,
          updates,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setState((prev) => ({ ...prev, editDialogOpen: false, selectedUser: null }))
        loadUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="destructive">
        <Crown className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="h-3 w-3 mr-1" />
        User
      </Badge>
    )
  }

  const getSubscriptionBadge = (subscription: UserProfile["subscriptions"][0] | undefined) => {
    if (!subscription) {
      return <Badge variant="outline">Free</Badge>
    }

    const variant = subscription.status === "active" ? "default" : "secondary"
    return <Badge variant={variant}>{subscription.tier}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={state.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={state.roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem> {/* Updated value prop to "all" */}
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : state.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                state.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || "No name"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getSubscriptionBadge(user.subscriptions[0])}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditUser(user)} variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {state.page} of {state.totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setState((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={state.page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setState((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={state.page === state.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog
          open={state.editDialogOpen}
          onOpenChange={(open) => setState((prev) => ({ ...prev, editDialogOpen: open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and permissions</DialogDescription>
            </DialogHeader>
            {state.selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={state.selectedUser.email} disabled />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={state.selectedUser.full_name || ""}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        selectedUser: prev.selectedUser ? { ...prev.selectedUser, full_name: e.target.value } : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={state.selectedUser.role}
                    onValueChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        selectedUser: prev.selectedUser
                          ? { ...prev.selectedUser, role: value as "user" | "admin" }
                          : null,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, editDialogOpen: false }))}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateUser({
                        full_name: state.selectedUser?.full_name,
                        role: state.selectedUser?.role,
                      })
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
