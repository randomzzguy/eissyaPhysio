export const canRenewPackage = (client) => client.payment_status === 'paid'
  && Number(client.sessions_used) >= Number(client.sessions_total);

export function renewPackageRecord(client, renewal, now = new Date().toISOString()) {
  if (!canRenewPackage(client)) throw new Error('Complete the current package and mark it paid before renewing.');
  return {
    ...client,
    package_history: [...(client.package_history || []), {
      package_name: client.package_name,
      package_price: client.package_price,
      sessions_total: client.sessions_total,
      sessions_used: client.sessions_used,
      cancelled_sessions: client.cancelled_sessions || 0,
      payment_status: client.payment_status,
      renewed_at: now,
    }],
    ...renewal,
    sessions_used: 0,
    cancelled_sessions: 0,
    status: 'active',
  };
}
