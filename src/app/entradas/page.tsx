'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';
import type { Ticket } from '@/lib/fint';
import EditTicketModal from '@/components/EditTicketModal';
import TopBar from '@/components/TopBar';
import Image from 'next/image';

export default function EntradasPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const router = useRouter();

  const fetchTickets = async (noCache = false) => {
    try {
      const url = noCache ? '/api/tickets?noCache=true' : '/api/tickets';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar las entradas');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createBrowserClient();

    // Check auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      await fetchTickets();
    };

    checkAuth();
  }, [router]);

  const handleEditSuccess = () => {
    setEditingTicket(null);
    setLoading(true);
    fetchTickets(true); // Force fresh data from Fint API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="Mis Entradas"
        subtitle={loading ? undefined : tickets.length > 0 ? `${tickets.length} ${tickets.length === 1 ? 'entrada' : 'entradas'}` : undefined}
        showBack
        largeTitle
      />

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar entradas
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-semibold mb-2">No tienes entradas</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cuando compres o recibas una entrada, aparecerá aquí.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
          <div
            key={ticket.externalId}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {/* QR Code Section */}
            {ticket.qrUrl && (
              <div className="bg-white p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <Image
                  src={ticket.qrUrl}
                  alt={`QR Code para ${ticket.eventName}`}
                  width={200}
                  height={200}
                  className="w-full max-w-[200px] h-auto"
                />
              </div>
            )}

            {/* Content Section */}
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{ticket.eventName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ticket.firstName} {ticket.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {ticket.userEmail}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    ticket.status === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              {/* Item name */}
              {ticket.itemName && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-semibold">
                  {ticket.itemName}
                </p>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                {ticket.purchaseReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Orden:</span>
                    <span className="font-mono text-xs">{ticket.purchaseReference}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
                  <span className="font-mono font-semibold text-xs">{ticket.reference}</span>
                </div>

                {ticket.document && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Documento:</span>
                    <span className="font-mono text-xs">{ticket.document}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTicket(ticket)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-center rounded-lg transition text-sm font-semibold"
                >
                  ✏️ Editar
                </button>
                {ticket.pdfUrl && (
                  <a
                    href={ticket.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg transition text-sm font-semibold"
                  >
                    📄 PDF
                  </a>
                )}
              </div>

              {/* Buyer info (if different from attendee) */}
              {ticket.buyerEmail && ticket.buyerEmail !== ticket.userEmail && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  Comprado por: {ticket.buyerEmail}
                </p>
              )}
            </div>
          </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTicket && (
        <EditTicketModal
          ticket={editingTicket}
          isOpen={!!editingTicket}
          onClose={() => setEditingTicket(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
