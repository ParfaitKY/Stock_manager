import React from 'react';

function Navbar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">Stock Manager</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-700 text-white'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  Tableau de Bord
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'products'
                      ? 'bg-blue-700 text-white'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setCurrentPage('products')}
                >
                  Gestion des Produits
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'stock'
                      ? 'bg-blue-700 text-white'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setCurrentPage('stock')}
                >
                  Mouvements de Stock
                </button>
              </div>
            </div>
          </div>
          <div>
            <button
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              onClick={onLogout}
            >
              Déconnexion
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                currentPage === 'dashboard'
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Tableau de Bord
            </button>
            <button
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                currentPage === 'products'
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`}
              onClick={() => setCurrentPage('products')}
            >
              Gestion des Produits
            </button>
            <button
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                currentPage === 'stock'
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`}
              onClick={() => setCurrentPage('stock')}
            >
              Mouvements de Stock
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;