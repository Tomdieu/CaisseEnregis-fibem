'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Calculator,
  User,
  Percent,
  Euro,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { usePOSStore } from '@/stores/posStore';

const POSSalesPage = () => {
  const { isOnline } = useNetworkStatus();
  const { products, addTransaction } = usePOSStore();
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0); // percentage discount
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0)); // Remove items with 0 quantity
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handlePayment = () => {
    if (isOnline) {
      // Add transaction to the store
      addTransaction({
        items: cart.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: subtotal,
        tax: subtotal * 0.08, // Assuming 8% tax
        discount: discountAmount,
        total: total,
        paymentMethod: 'Carte', // This would be dynamic in a real app
        cashier: 'Current User', // This would be the logged-in user
      });

      alert(`Paiement de €${total.toFixed(2)} effectué avec succès!`);
      setCart([]);
      setDiscount(0);
    } else {
      // Store transaction locally for later sync
      const transaction = {
        id: `offline-${Date.now()}`,
        items: cart.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: subtotal,
        tax: subtotal * 0.08, // Assuming 8% tax
        discount: discountAmount,
        total: total,
        paymentMethod: 'Hors ligne',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5),
        cashier: 'Hors ligne',
      };

      // Save to localStorage for later sync
      const offlineTransactions = JSON.parse(localStorage.getItem('offlineTransactions') || '[]');
      offlineTransactions.push(transaction);
      localStorage.setItem('offlineTransactions', JSON.stringify(offlineTransactions));

      alert(`Transaction enregistrée hors ligne. Elle sera synchronisée lorsque la connexion sera rétablie.`);
      setCart([]);
      setDiscount(0);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Product Selection */}
      <div className="w-2/5 border-r p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Caisse enregistreuse</h1>
          <p className="text-muted-foreground">Système de point de vente</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center ml-4">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">En ligne</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">Hors ligne</span>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Tous', 'Boissons', 'Pâtisserie', 'Sandwichs', 'Plats'].map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="cursor-pointer whitespace-nowrap"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-muted rounded-full p-3 mb-2">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium truncate w-full">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="font-semibold mt-1">€{product.price.toFixed(2)}</p>
                  <Badge variant="secondary" className="mt-2">
                    Stock: {product.stock}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart and Payment */}
      <div className="w-3/5 flex flex-col">
        {/* Top Bar */}
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Client: {selectedCustomer ? selectedCustomer.name : 'Anonyme'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Changer client
            </Button>
            <Button variant="outline" size="sm">
              <Percent className="h-4 w-4 mr-2" />
              Remise
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Panier ({cart.length} articles)</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ajoutez des produits au panier</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">€{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="font-medium">€{(item.price * item.quantity).toFixed(2)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount Section */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Remise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Remise (%)"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="max-w-[150px]"
                />
                <span>%</span>
                <div className="ml-auto">
                  <p className="text-sm text-muted-foreground">Remise: €{discountAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="border-t p-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-muted-foreground">Sous-total</p>
              <p className="text-xl font-semibold">€{subtotal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Remise</p>
              <p className="text-xl font-semibold">-€{discountAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">€{total.toFixed(2)}</p>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button variant="outline" size="lg" disabled={!isOnline}>
                <CreditCard className="h-5 w-5 mr-2" />
                Carte
              </Button>
              <Button variant="outline" size="lg">
                <Euro className="h-5 w-5 mr-2" />
                Espèces
              </Button>
              <Button
                size="lg"
                className={isOnline ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                onClick={handlePayment}
                disabled={cart.length === 0}
              >
                {isOnline ? 'Valider la vente' : 'Enregistrer hors ligne'}
              </Button>
            </div>
          </div>
          {!isOnline && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
              <p className="text-blue-800 text-sm">
                <strong>Mode hors ligne activé:</strong> Les ventes seront synchronisées lorsque la connexion sera rétablie.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSSalesPage;