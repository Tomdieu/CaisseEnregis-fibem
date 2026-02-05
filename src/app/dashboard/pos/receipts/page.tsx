'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  Download,
  Search,
  FileText,
  CreditCard,
  Euro
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePOSStore } from '@/stores/posStore';
import jsPDF from 'jspdf';

const POSReceiptsPage = () => {
  const { transactions } = usePOSStore();
  const [selectedReceipt, setSelectedReceipt] = useState(transactions[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const receiptRef = useRef(null);

  const filteredReceipts = transactions.filter(receipt =>
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.customer && receipt.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    receipt.date.includes(searchTerm)
  );

  const handlePrint = () => {
    if (!selectedReceipt) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('CAFÉ BONHEUR', 105, 20, { align: 'center' });

    // Add address
    doc.setFontSize(10);
    doc.text('123 Rue de la Paix, 75001 Paris', 105, 30, { align: 'center' });
    doc.text('+33 1 23 45 67 89', 105, 35, { align: 'center' });

    // Add receipt header
    doc.setFontSize(14);
    doc.text('REÇU DE CAISSE', 105, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Numéro: ${selectedReceipt.id}`, 20, 55);
    doc.text(`Date: ${selectedReceipt.date} à ${selectedReceipt.time}`, 20, 60);
    doc.text(`Caisse: ${selectedReceipt.cashier}`, 20, 65);

    // Add items header
    let yPos = 75;
    doc.setFontSize(12);
    doc.text('Article', 20, yPos);
    doc.text('Qté', 100, yPos);
    doc.text('Prix', 130, yPos);
    doc.text('Total', 160, yPos);

    yPos += 10;
    doc.line(15, yPos - 2, 190, yPos - 2); // horizontal line

    // Add items
    doc.setFontSize(10);
    selectedReceipt.items.forEach((item, index) => {
      doc.text(item.name.substring(0, 20), 20, yPos); // limit name length
      doc.text(item.qty.toString(), 100, yPos);
      doc.text(`${item.price.toFixed(2)}€`, 130, yPos);
      doc.text(`${item.total.toFixed(2)}€`, 160, yPos);
      yPos += 8;
    });

    yPos += 10;
    doc.line(15, yPos - 2, 190, yPos - 2); // horizontal line

    // Add totals
    doc.text(`Sous-total: ${selectedReceipt.subtotal.toFixed(2)}€`, 120, yPos);
    yPos += 8;
    doc.text(`Taxe (8%): ${selectedReceipt.tax.toFixed(2)}€`, 120, yPos);
    yPos += 8;
    if (selectedReceipt.discount > 0) {
      doc.text(`Remise: -${selectedReceipt.discount.toFixed(2)}€`, 120, yPos);
      yPos += 8;
    }
    doc.setFontSize(12);
    doc.text(`TOTAL: ${selectedReceipt.total.toFixed(2)}€`, 120, yPos);
    yPos += 10;

    doc.text(`Moyen de paiement: ${selectedReceipt.paymentMethod}`, 20, yPos);

    // Add footer
    yPos += 20;
    doc.setFontSize(8);
    doc.text('Merci de votre visite!', 105, yPos, { align: 'center' });
    doc.text('Nous espérons vous revoir bientôt', 105, yPos + 5, { align: 'center' });
    doc.text(`Reçu imprimé le ${new Date().toLocaleDateString()}`, 105, yPos + 10, { align: 'center' });

    // Save the PDF
    doc.save(`receipt_${selectedReceipt.id}.pdf`);
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Fonctionnalité de téléchargement PDF à implémenter');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reçus et factures</h1>
          <p className="text-muted-foreground">
            Générez, imprimez et gérez les reçus de vos transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historique des reçus</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredReceipts.map((receipt) => (
                  <div 
                    key={receipt.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted ${
                      selectedReceipt?.id === receipt.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedReceipt(receipt)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{receipt.id}</h3>
                        <p className="text-sm text-muted-foreground">{receipt.date} à {receipt.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{receipt.total.toFixed(2)}</p>
                        <Badge variant="outline">{receipt.paymentMethod}</Badge>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{receipt.customer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aperçu du reçu</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 max-w-md mx-auto bg-white shadow-sm" ref={receiptRef}>
                {/* Receipt Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">CAFÉ BONHEUR</h2>
                  <p className="text-sm text-muted-foreground">123 Rue de la Paix, 75001 Paris</p>
                  <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                  <Separator className="my-3" />
                </div>

                {/* Receipt Info */}
                <div className="text-center mb-4">
                  <h3 className="font-bold">REÇU DE CAISSE</h3>
                  <p className="text-sm">Numéro: {selectedReceipt?.id}</p>
                  <p className="text-sm">{selectedReceipt?.date} à {selectedReceipt?.time}</p>
                  <p className="text-sm">Caisse: {selectedReceipt?.cashier}</p>
                </div>

                <Separator className="my-4" />

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {selectedReceipt?.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span>{item.qty}x </span>
                        <span>{item.name}</span>
                      </div>
                      <span>€{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>€{selectedReceipt?.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxe (8%):</span>
                    <span>€{selectedReceipt?.tax.toFixed(2)}</span>
                  </div>
                  {selectedReceipt?.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Remise:</span>
                      <span>-€{selectedReceipt?.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>€{selectedReceipt?.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moyen de paiement:</span>
                    <span>{selectedReceipt?.paymentMethod}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground">
                  <p>Merci de votre visite!</p>
                  <p>Nous espérons vous revoir bientôt</p>
                  <div className="flex justify-center mt-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="mt-2">Reçu imprimé le {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Invoice Options */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Options de facturation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Convertir en facture</h4>
                          <p className="text-sm text-muted-foreground">Générer une facture officielle pour ce reçu</p>
                        </div>
                        <Button variant="outline">Créer facture</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Envoyer par email</h4>
                          <p className="text-sm text-muted-foreground">Envoyer ce reçu au client par email</p>
                        </div>
                        <Button variant="outline">Envoyer</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Archiver</h4>
                          <p className="text-sm text-muted-foreground">Archiver ce reçu pour les archives</p>
                        </div>
                        <Button variant="outline">Archiver</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POSReceiptsPage;