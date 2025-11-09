import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [error, setError] = useState('');

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return; // Evite double appel en mode Strict (dev)
    didInit.current = true;
    const load = async () => {
      try {
        setError('');
        const [productsRes, movementsRes] = await Promise.all([
          api.get('/products'),
          api.get('/movements')
        ]);
        const products = productsRes.data.products || [];
        const movements = movementsRes.data.movements || [];
        setTotalProducts(products.length);
        const lowStock = products.filter(product => product.quantity < product.minThreshold);
        setLowStockProducts(lowStock);
        const recent = [...movements]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentMovements(recent);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Impossible de charger les données du tableau de bord.';
        setError(msg);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
        Tableau de Bord
      </h1>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Products Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 flex flex-col items-center border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" /></svg>
            Total des Produits
          </h2>
          <p className="text-4xl font-extrabold text-blue-600 mt-4">{totalProducts}</p>
        </div>
        
        {/* Low Stock Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 flex flex-col items-center border border-red-200">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Produits en Stock Bas
          </h2>
          <p className="text-4xl font-extrabold text-red-500 mt-4">{lowStockProducts.length}</p>
        </div>
        
        {/* Recent Movements */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 flex flex-col items-center border border-green-200 md:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Mouvements Récents
          </h2>
          <p className="text-sm text-gray-500 mt-2">Les 5 derniers mouvements</p>
          <div className="w-full mt-4 space-y-2">
            {recentMovements.length > 0 ? (
              recentMovements.map((movement) => (
                <div key={movement.id} className="w-full flex items-center justify-between bg-white/70 backdrop-blur-sm border border-green-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">{movement.productName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${movement.type === 'entrée' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                      {movement.type === 'entrée' ? 'Entrée' : 'Sortie'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{new Date(movement.date).toLocaleDateString()}</span>
                    <span className="text-sm font-semibold text-gray-700">x{movement.quantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center">Aucun mouvement récent</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Low Stock Products List */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Produits en Stock Bas
        </h2>
        {lowStockProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                    Stock Actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                    Seuil Minimum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.minThreshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun produit en stock bas</p>
        )}
      </div>
      
      {/* Recent Movements Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
        <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          Historique Récent
        </h2>
        {recentMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                    Quantité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movement.type === 'entrée' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {movement.type === 'entrée' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun mouvement récent</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
