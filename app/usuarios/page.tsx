"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UsersTable } from "@/components/users/users-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export default function UsuariosPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleUserCreated = () => {
    // La tabla se actualizará automáticamente cuando se cierre el diálogo
    window.location.reload()
  }

  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["write"]} role="admin">
        <div className="container mx-auto py-6">
          <UsersTable onCreateUser={() => setShowCreateDialog(true)} />

          <CreateUserDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onUserCreated={handleUserCreated}
          />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
