import { useState, useEffect } from 'react';
import { getProducts, getStockMovements, saveStockMovements, updateProductQuantity } from '../utils/storage';

function StockMovement() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    type: 'entrée',
    note: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const loadedProducts = getProducts();
    const loadedMovements = getStockMovements();
    
    setProducts(loadedProducts);
    setMovements(loadedMovements);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'quantity' ? Math.max(1, parseInt(value) || 0) : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedProduct = products.find(p => p.id === formData.productId);
    if (!selectedProduct) {
      alert("Veuillez sélectionner un produit.");
      return;
    }
    
    if (formData.type === 'sortie' && selectedProduct.quantity < formData.quantity) {
      alert(`Stock insuffisant. Stock actuel: ${selectedProduct.quantity}`);
      return;
    }
    
    // Create new movement
    const newMovement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      type: formData.type,
      note: formData.note
    };
    
    // Update movements
    const updatedMovements = [newMovement, ...movements];
    saveStockMovements(updatedMovements);
    setMovements(updatedMovements);
    
    // Update product quantity
    const quantityChange = formData.type === 'entrée' ? formData.quantity : -formData.quantity;
    const success = updateProductQuantity(formData.productId, quantityChange);
    
    if (success) {
      // Reset form except for the type
      setFormData({
        productId: '',
        quantity: 1,
        type: formData.type,
        note: ''
      });
      
      // Reload products to get updated quantities
      loadData();
    }
  };
  
  const exportMovements = () => {
    // Create CSV headers
    const headers = ['ID', 'Date', 'Produit', 'Type', 'Quantité', 'Note'];
    
    // Convert movements to CSV rows
    const rows = movements.map(m => [
      m.id,
      new Date(m.date).toLocaleString(),
      m.productName,
      m.type,
      m.quantity,
      m.note || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movements_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Filter movements based on search term
  const filteredMovements = movements.filter(movement => 
    movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mouvements de Stock</h1>
      
      {/* Stock Movement Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Enregistrer un mouvement
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                Produit
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">Sélectionner un produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type de mouvement
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="entrée">Entrée de stock</option>
                <option value="sortie">Sortie de stock</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantité
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                step="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Note (optionnel)
              </label>
              <input
                type="text"
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
      
      {/* Movements History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-700">Historique des mouvements</h2>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un mouvement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <button 
              onClick={exportMovements}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movement.type === 'entrée' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'entrée' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.note || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Aucun mouvement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockMovement;