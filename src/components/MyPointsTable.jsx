import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import Pagination from './Pagination';
import usePagination from '../hooks/usePagination';

const MyPointsTable = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saldo, setSaldo] = useState(0);

  // Paginação usando hook personalizado
  const {
    currentItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination(points, 10);

  // Estado para acordeons abertos no mobile
  const [openAccordions, setOpenAccordions] = useState([]);

  const toggleAccordion = (index) => {
    setOpenAccordions((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handlePageChange = (page) => {
    goToPage(page);
  };

  useEffect(() => {
    const fetchMyPoints = async () => {
      if (!user?.idparticipante) {
        setError('Usuário não identificado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.meusPontos(user.idparticipante);
        
        if (response.success === 1 && response.data) {
          // A API retorna os pontos em response.data.transacoes
          const transacoes = response.data.transacoes || [];
          setPoints(transacoes);
          setSaldo(response.data.saldo || 0);
        } else {
          setError(response.message || 'Erro ao carregar pontos');
        }
      } catch (error) {
        console.error("Erro ao buscar pontos:", error);
        setError('Erro de comunicação. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPoints();
  }, [user?.idparticipante]);

  // Componente de Loading
  const LoadingSpinner = () => (
    <div className="loading-message flex justify-center items-center py-12">
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ea4ea1',
        borderRadius: '50%',
        width: 32,
        height: 32,
        animation: 'spin 1s linear infinite'
      }} />
      <span className="ml-3 text-gray-600">Carregando dados...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Componente de Erro
  const ErrorMessage = () => (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Tentar Novamente
      </button>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage />;
  }

  return (
    <div className="points-table-container">
      <div className="balance-box mb-4">Seu saldo total: <strong>{saldo} pts</strong></div>
      {/* Tabela tradicional no desktop */}
      <div className="table-div overflow-x-auto">
        <table className="product-table hidden md:table min-w-full" cellSpacing={0} cellPadding={0}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Loja</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Pontos Conquistados</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((point, index) => (
              <tr key={index}>
                <td>{point.datacompra}</td>
                <td>{point.loja_nome || '-'}</td>
                <td>{point.produto_nome}</td>
                <td>{point.tr_qtde_produto}</td>
                <td>{point.tr_pontos}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Acordeon para mobile */}
        <div className="points-acordion-container flex flex-col gap-2 md:hidden">
          {currentItems.map((point, index) => (
            <div key={index} className="border rounded-lg bg-white">
              <button
                className="acordion w-full flex items-center justify-between p-4 font-semibold focus:outline-none"
                onClick={() => toggleAccordion(index)}
                aria-expanded={!!openAccordions[index]}
                aria-controls={`accordion-content-${index}`}
              >
                <span className="text-left flex-1">Produto: {point.produto_nome}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{point.datacompra}</span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${openAccordions[index] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              {openAccordions[index] && (
                <ul id={`accordion-content-${index}`} className="px-4 pb-4 text-sm animate-fade-in">
                  <li><span className="font-semibold">Loja:</span> {point.loja_nome || '-'}</li>
                  <li><span className="font-semibold">Quantidade:</span> {point.tr_qtde_produto}</li>
                  <li><span className="font-semibold">Pontos Conquistados:</span> {point.tr_pontos}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
        
        {points.length === 0 && !loading && !error && (
          <div className="text-center py-12 table-message">
            <p className="text-gray-500">Você não tem pontuação nesse momento.</p>
          </div>
        )}
        
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>
    </div>
  );
}

export default MyPointsTable; 