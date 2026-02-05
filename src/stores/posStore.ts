import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  supplier: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  points: number;
  visits: number;
  lastVisit: string;
  address: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface Transaction {
  id: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  date: string;
  time: string;
  customer?: string;
  cashier: string;
}

interface POSState {
  products: Product[];
  customers: Customer[];
  users: User[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'points' | 'visits' | 'lastVisit'>) => void;
  updateCustomer: (id: number, updates: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  deleteUser: (id: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

export const usePOSStore = create<POSState>()(
  devtools(
    persist(
      (set, get) => ({
        products: [
          { id: 1, name: 'Café noir', price: 2.50, category: 'Boissons', stock: 45, barcode: '1234567890123', supplier: 'Café Premium SA' },
          { id: 2, name: 'Croissant', price: 2.00, category: 'Pâtisserie', stock: 32, barcode: '1234567890124', supplier: 'Boulangerie du Centre' },
          { id: 3, name: 'Pain au chocolat', price: 2.50, category: 'Pâtisserie', stock: 28, barcode: '1234567890125', supplier: 'Boulangerie du Centre' },
          { id: 4, name: 'Jus d\'orange', price: 4.00, category: 'Boissons', stock: 15, barcode: '1234567890126', supplier: 'Fruits et Jus SARL' },
          { id: 5, name: 'Sandwich jambon', price: 7.00, category: 'Sandwichs', stock: 20, barcode: '1234567890127', supplier: 'Charcuterie Fine' },
        ],
        customers: [
          { id: 1, firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@example.com', phone: '+33 6 12 34 56 78', points: 1250, visits: 42, lastVisit: '2024-01-15', address: '123 Rue de la Paix, 75001 Paris' },
          { id: 2, firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@example.com', phone: '+33 6 98 76 54 32', points: 850, visits: 28, lastVisit: '2024-01-14', address: '45 Avenue des Champs-Élysées, 75008 Paris' },
          { id: 3, firstName: 'Sophie', lastName: 'Leroy', email: 'sophie.leroy@example.com', phone: '+33 6 55 44 33 22', points: 2100, visits: 65, lastVisit: '2024-01-13', address: '78 Boulevard Saint-Germain, 75006 Paris' },
        ],
        users: [
          { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@cafebonheur.fr', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
          { id: 2, firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@cafebonheur.fr', role: 'manager', status: 'active', lastLogin: '2024-01-15' },
          { id: 3, firstName: 'Pierre', lastName: 'Bernard', email: 'pierre.bernard@cafebonheur.fr', role: 'cashier', status: 'active', lastLogin: '2024-01-14' },
        ],
        transactions: [
          {
            id: 'TXN-001',
            items: [
              { name: 'Café noir', qty: 2, price: 2.50, total: 5.00 },
              { name: 'Croissant', qty: 2, price: 2.00, total: 4.00 },
            ],
            subtotal: 9.00,
            tax: 0.72,
            discount: 0,
            total: 9.72,
            paymentMethod: 'Carte',
            date: '2024-01-15',
            time: '10:24',
            customer: 'Marie Dubois',
            cashier: 'Jean Dupont'
          },
        ],
        
        addProduct: (product) => {
          const newProduct = {
            ...product,
            id: Date.now(), // Using timestamp as ID for simplicity
          };
          set((state) => ({ products: [...state.products, newProduct] }));
          get().saveToLocalStorage();
        },
        
        updateProduct: (id, updates) => {
          set((state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product
            ),
          }));
          get().saveToLocalStorage();
        },
        
        deleteProduct: (id) => {
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
          }));
          get().saveToLocalStorage();
        },
        
        addCustomer: (customer) => {
          const newCustomer = {
            ...customer,
            id: Date.now(),
            points: 0,
            visits: 0,
            lastVisit: new Date().toISOString().split('T')[0],
          };
          set((state) => ({ customers: [...state.customers, newCustomer] }));
          get().saveToLocalStorage();
        },
        
        updateCustomer: (id, updates) => {
          set((state) => ({
            customers: state.customers.map((customer) =>
              customer.id === id ? { ...customer, ...updates } : customer
            ),
          }));
          get().saveToLocalStorage();
        },
        
        deleteCustomer: (id) => {
          set((state) => ({
            customers: state.customers.filter((customer) => customer.id !== id),
          }));
          get().saveToLocalStorage();
        },
        
        addUser: (user) => {
          const newUser = {
            ...user,
            id: Date.now(),
            lastLogin: new Date().toISOString().split('T')[0],
          };
          set((state) => ({ users: [...state.users, newUser] }));
          get().saveToLocalStorage();
        },
        
        updateUser: (id, updates) => {
          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updates } : user
            ),
          }));
          get().saveToLocalStorage();
        },
        
        deleteUser: (id) => {
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
          }));
          get().saveToLocalStorage();
        },
        
        addTransaction: (transaction) => {
          const newTransaction = {
            ...transaction,
            id: `TXN-${Date.now()}`,
            date: transaction.date || new Date().toISOString().split('T')[0],
            time: transaction.time || new Date().toTimeString().substring(0, 5),
          };
          set((state) => ({ transactions: [...state.transactions, newTransaction] }));
          get().saveToLocalStorage();
        },
        
        loadFromLocalStorage: () => {
          // This is handled by the persist middleware
        },
        
        saveToLocalStorage: () => {
          // This is handled by the persist middleware
        },
      }),
      {
        name: 'pos-storage', // name of the item in the storage (must be unique)
        partialize: (state) => ({ 
          products: state.products, 
          customers: state.customers, 
          users: state.users,
          transactions: state.transactions
        }), // only persist specific parts of the state
      }
    )
  )
);