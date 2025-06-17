"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { MoreHorizontal, UserPlus, Shield, User, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllUsers, updateUserRole, type UserWithRole } from "@/lib/supabase/users"
import { InviteUserModal } from "./invite-user-modal"
import { useToast } from "@/hooks/use-toast"

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800"
    case "manager":
      return "bg-blue-100 text-blue-800"
    case "user":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Crown className="h-3 w-3" />
    case "manager":
      return <Shield className="h-3 w-3" />
    case "user":
      return <User className="h-3 w-3" />
    default:
      return <User className="h-3 w-3" />
  }
}

interface UsersTableProps {
  refreshTrigger?: number
}

export function UsersTable({ refreshTrigger = 0 }: UsersTableProps) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const { toast } = useToast()

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getAllUsers()
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(result.users)
      }
    } catch (err) {
      setError("Failed to load users. Please try again.")
      console.error("Error loading users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [refreshTrigger])

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setUpdatingRole(userId)

    try {
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        toast({
          title: "Role Updated",
          description: `User role has been updated to ${newRole}`,
        })
        loadUsers() // Refresh the users list
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdatingRole(null)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  const getDisplayName = (user: UserWithRole) => {
    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user.email
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <Button onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {users.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by inviting your first user.</p>
              <div className="mt-6">
                <Button onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{getDisplayName(user)}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role || "user")} variant="secondary">
                          {getRoleIcon(user.role || "user")}
                          <span className="ml-1 capitalize">{user.role || "user"}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={updatingRole === user.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleUpdate(user.id, "user")}
                              disabled={user.role === "user"}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Make User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleUpdate(user.id, "manager")}
                              disabled={user.role === "manager"}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleUpdate(user.id, "admin")}
                              disabled={user.role === "admin"}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} onUserInvited={loadUsers} />
    </>
  )
}
