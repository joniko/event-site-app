'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import type { Ticket } from '@/lib/fint';

export default function EntradasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Check auth
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch tickets
      try {
        const response = await fetch('/api/tickets');
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
    });
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis Entradas</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis Entradas</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Error al cargar entradas
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis Entradas</h1>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Entradas</h1>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {tickets.length} {tickets.length === 1 ? 'entrada' : 'entradas'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.externalId}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{ticket.eventName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {ticket.firstName} {ticket.lastName}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {ticket.itemName}
              </p>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
                <span className="font-mono font-semibold">{ticket.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                <span className="font-semibold">${ticket.amount}</span>
              </div>
              {ticket.purchaseReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Compra:</span>
                  <span className="font-mono text-xs">{ticket.purchaseReference}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {ticket.qrUrl && (
                <a
                  href={ticket.qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg transition text-sm font-semibold"
                >
                  Ver QR
                </a>
              )}
              {ticket.pdfUrl && (
                <a
                  href={ticket.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-center rounded-lg transition text-sm font-semibold"
                >
                  Ver PDF
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
        ))}
      </div>
    </div>
  );
}
