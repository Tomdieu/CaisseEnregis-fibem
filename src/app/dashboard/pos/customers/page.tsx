'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  MapPin,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { usePOSStore } from '@/stores/posStore';

const POSCustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = usePOSStore();
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (id) => {
    deleteCustomer(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCustomer) {
      // Update existing customer
      updateCustomer(editingCustomer.id, formData);
    } else {
      // Add new customer
      addCustomer({
        ...formData,
        address: formData.address
      });
    }

    setIsDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getLoyaltyLevel = (points) => {
    if (points >= 3000) return { level: 'Platine', color: 'text-blue-500', icon: Star };
    if (points >= 2000) return { level: 'Gold', color: 'text-yellow-500', icon: Star };
    if (points >= 1000) return { level: 'Silver', color: 'text-gray-400', icon: Star };
    return { level: 'Bronze', color: 'text-amber-700', icon: Star };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des clients</h1>
          <p className="text-muted-foreground">
            Suivez vos clients et gérez leur programme de fidélité
          </p>
        </div>
        <Button onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recherche de clients</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom, email ou téléphone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Points fidélité</th>
                  <th className="text-left py-3 px-4">Visites</th>
                  <th className="text-left py-3 px-4">Dernière visite</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const loyalty = getLoyaltyLevel(customer.points);
                  return (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-muted rounded-full p-2 mr-3">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                            <div className="text-sm text-muted-foreground">{customer.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <loyalty.icon className={`h-4 w-4 mr-1 ${loyalty.color}`} />
                          <span className={loyalty.color}>{customer.points} pts</span>
                          <Badge variant="outline" className={`ml-2 ${loyalty.color}`}>
                            {loyalty.level}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">{customer.visits}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {customer.lastVisit}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Customer Details View */}
      {filteredCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détails du client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Programme de fidélité</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total des points</p>
                      <p className="text-2xl font-bold">8,450</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Réduction fidélité</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points par euro dépensé</span>
                      <span className="font-medium">1 pt/€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points pour récompense</span>
                      <span className="font-medium">500 pts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Historique récent</h3>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15', amount: 24.50, points: 24 },
                    { date: '2024-01-10', amount: 18.75, points: 18 },
                    { date: '2024-01-05', amount: 32.00, points: 32 },
                    { date: '2023-12-28', amount: 15.25, points: 15 },
                  ].map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Transaction #{1000 + index}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{transaction.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">+{transaction.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Modifier le client' : 'Ajouter un nouveau client'}
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
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingCustomer ? 'Mettre à jour' : 'Ajouter le client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSCustomersPage;