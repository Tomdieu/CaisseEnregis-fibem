'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Users,
  Shield,
  Lock,
  Search,
  Plus,
  Edit,
  Trash2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePOSStore, type User as UserType } from '@/stores/posStore';

const POSUserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = usePOSStore();
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as 'admin' | 'manager' | 'cashier' | '',
    password: ''
  });

  // Filter users based on search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.role.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    deleteUser(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const { role, password, ...rest } = formData;
      const updates: Partial<UserType> = rest;
      if (role) {
        updates.role = role;
      }
      updateUser(editingUser.id, updates);
    } else {
      // Add new user
      if (formData.role) {
        const { password, ...rest } = formData;
        addUser({
          ...rest,
          role: formData.role,
          status: 'active',
        });
      }
    }

    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleDetails = (role: 'admin' | 'manager' | 'cashier') => {
    switch(role) {
      case 'admin':
        return { label: 'Administrateur', color: 'bg-red-100 text-red-800', permissions: ['Toutes les permissions'] };
      case 'manager':
        return { label: 'Manager', color: 'bg-blue-100 text-blue-800', permissions: ['Gestion des employés', 'Accès aux rapports', 'Gestion des produits'] };
      case 'cashier':
        return { label: 'Caissier', color: 'bg-green-100 text-green-800', permissions: ['Encaissement', 'Gestion du panier', 'Accès limité aux rapports'] };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', permissions: [] };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les rôles et permissions de votre équipe
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recherche d'utilisateurs</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom, email ou rôle..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Utilisateur</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Rôle</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Dernière connexion</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleDetails = getRoleDetails(user.role);
                  return (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-muted rounded-full p-2 mr-3">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={roleDetails.color}>{roleDetails.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{user.lastLogin}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['admin', 'manager', 'cashier'] as const).map((role) => {
          const roleDetails = getRoleDetails(role);
          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {roleDetails.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Permissions:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {roleDetails.permissions.map((permission, idx) => (
                      <li key={idx} className="text-sm">{permission}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Caissier</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={editingUser ? "Laisser vide pour conserver le mot de passe actuel" : "Entrez un mot de passe"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSUserManagementPage;