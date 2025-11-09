import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Form state
  const [isAddMode, setIsAddMode] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    buyPrice: 0,
    sellPrice: 0,
    minThreshold: 0,
  });

  const didInit = useRef(false);

  useEffect(() => {
    // Garde contre la double exécution en React StrictMode
    if (didInit.current) return;
    didInit.current = true;
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setError('');
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Impossible de charger les produits.';
      setError(msg);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = ['quantity', 'buyPrice', 'sellPrice', 'minThreshold'].includes(name) 
      ? parseFloat(value) || 0 
      : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      buyPrice: 0,
      sellPrice: 0,
      minThreshold: 0,
    });
    setIsAddMode(true);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (isAddMode) {
        await api.post('/products', {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          buyPrice: formData.buyPrice,
          sellPrice: formData.sellPrice,
          minThreshold: formData.minThreshold,
        });
      } else if (editingId) {
        await api.put(`/products/${editingId}`, {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          buyPrice: formData.buyPrice,
          sellPrice: formData.sellPrice,
          minThreshold: formData.minThreshold,
        });
      }
      await loadProducts();
      resetForm();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Échec de l’enregistrement du produit.';
      setError(msg);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      minThreshold: product.minThreshold,
    });
    setIsAddMode(false);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      await api.delete(`/products/${id}`);
      await loadProducts();
    }
  };

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };
  
  const exportData = () => {
    // Convert products to JSON
    const jsonData = JSON.stringify(products, null, 2);
    
    // Create a Blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const exportCSV = () => {
    // Create CSV headers
    const headers = ['ID', 'Nom', 'Catégorie', 'Quantité', 'Prix d\'achat (FCFA)', 'Prix de vente (FCFA)', 'Seuil minimum'];
    
    // Convert products to CSV rows
    const rows = products.map(product => [
      product.id,
      product.name,
      product.category,
      product.quantity,
      product.buyPrice,
      product.sellPrice,
      product.minThreshold
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
    a.download = 'products_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = sortField === 'name' || sortField === 'category' 
        ? a[sortField].toLowerCase() 
        : a[sortField];
      
      const fieldB = sortField === 'name' || sortField === 'category' 
        ? b[sortField].toLowerCase() 
        : b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Produits</h1>
      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>
      )}
      
      {/* Product Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {isAddMode ? 'Ajouter un produit' : 'Modifier le produit'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du produit
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantité en stock
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="buyPrice" className="block text-sm font-medium text-gray-700">
                Prix d'achat
              </label>
              <input
                type="number"
                id="buyPrice"
                name="buyPrice"
                value={formData.buyPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700">
                Prix de vente
              </label>
              <input
                type="number"
                id="sellPrice"
                name="sellPrice"
                value={formData.sellPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="minThreshold" className="block text-sm font-medium text-gray-700">
                Seuil minimum
              </label>
              <input
                type="number"
                id="minThreshold"
                name="minThreshold"
                value={formData.minThreshold}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            {!isAddMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isAddMode ? 'Ajouter' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Product List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-700">Liste des produits</h2>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={exportData}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                Export JSON
              </button>
              <button 
                onClick={exportCSV}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  Catégorie {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  Quantité {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('buyPrice')}
                >
                  Prix d'achat {sortField === 'buyPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sellPrice')}
                >
                  Prix de vente {sortField === 'sellPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('minThreshold')}
                >
                  Seuil minimum {sortField === 'minThreshold' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={product.quantity < product.minThreshold ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      product.quantity < product.minThreshold ? 'text-red-600 font-bold' : 'text-gray-500'
                    }`}>
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(product.buyPrice, 10)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(product.sellPrice, 10)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.minThreshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Aucun produit trouvé
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

export default ProductManagement;
