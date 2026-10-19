import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { isDemoMode, supabase } from '../supabaseClient';

const packageOptions = {
  'Single Session': { sessions: 1, price: 120 },
  'Trial Pack': { sessions: 3, price: 330 },
  'Progress Pack': { sessions: 6, price: 600 },
};

const addDays = (days, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const portalNow = new Date();

const demoClients = [
  {
    id: 'demo-1', name: 'Aina Rahman', phone: '+60 12-681 4092', email: 'aina.rahman@example.com',
    location: 'Taman Canning, Ipoh', condition: 'Lower back pain', package_name: 'Progress Pack',
    sessions_total: 6, sessions_used: 4, next_session: addDays(0, 14, 30), schedule: 'Mondays, 2:30 PM',
    payment_due_date: addDays(8).slice(0, 10), status: 'active', notes: 'Focus on core stability and safe lifting technique.',
  },
  {
    id: 'demo-2', name: 'Kavitha Nair', phone: '+60 17-532 8810', email: 'kavitha.n@example.com',
    location: 'Bercham, Ipoh', condition: 'Post-stroke mobility', package_name: 'Progress Pack',
    sessions_total: 6, sessions_used: 2, next_session: addDays(1, 9, 0), schedule: 'Tuesdays, 9:00 AM',
    payment_due_date: addDays(15).slice(0, 10), status: 'active', notes: 'Daughter will be present. Bring gait belt.',
  },
  {
    id: 'demo-3', name: 'Lim Wei Jian', phone: '+60 16-208 7451', email: 'weijian.lim@example.com',
    location: 'Greentown, Ipoh', condition: 'Shoulder impingement', package_name: 'Trial Pack',
    sessions_total: 3, sessions_used: 2, next_session: addDays(2, 16, 0), schedule: 'Wednesdays, 4:00 PM',
    payment_due_date: addDays(3).slice(0, 10), status: 'active', notes: 'Review desk posture and resistance-band programme.',
  },
  {
    id: 'demo-4', name: 'Nur Amira', phone: '+60 19-445 1206', email: '',
    location: 'Meru, Ipoh', condition: 'Knee osteoarthritis', package_name: 'Trial Pack',
    sessions_total: 3, sessions_used: 3, next_session: null, schedule: 'Flexible afternoons',
    payment_due_date: addDays(-1).slice(0, 10), status: 'active', notes: 'Package complete; discuss renewal on follow-up call.',
  },
  {
    id: 'demo-5', name: 'David Tan', phone: '+60 11-3720 0918', email: 'david.tan@example.com',
    location: 'Station 18, Ipoh', condition: 'Ankle sprain', package_name: 'Single Session',
    sessions_total: 1, sessions_used: 0, next_session: addDays(4, 11, 30), schedule: 'Friday, 11:30 AM',
    payment_due_date: addDays(4).slice(0, 10), status: 'active', notes: 'Initial assessment. Injury occurred while playing badminton.',
  },
  {
    id: 'demo-6', name: 'Siti Hajar', phone: '+60 13-998 7632', email: 'siti.hajar@example.com',
    location: 'Tambun, Ipoh', condition: 'Postnatal recovery', package_name: 'Progress Pack',
    sessions_total: 6, sessions_used: 6, next_session: null, schedule: 'Completed',
    payment_due_date: addDays(-20).slice(0, 10), status: 'completed', notes: 'Programme completed with good progress.',
  },
];

const emptyClient = {
  name: '', phone: '', email: '', location: '', condition: '', package_name: 'Trial Pack',
  sessions_total: 3, sessions_used: 0, next_session: '', schedule: '', payment_due_date: '', status: 'active', notes: '',
};

const formatDate = (value, options = {}) => {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(new Date(value));
};

const formatTime = (value) => value
  ? new Intl.DateTimeFormat('en-MY', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
  : '—';

const daysUntil = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${value}T00:00:00`) - today) / 86400000);
};

const getInitials = (name = '') => name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
const phoneHref = (phone = '') => `https://wa.me/${phone.replace(/\D/g, '')}`;

function MetricCard({ icon: Icon, label, value, helper, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon aria-hidden="true" /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </article>
  );
}

function SessionDots({ total, used }) {
  const safeTotal = Math.max(Number(total) || 0, 1);
  return (
    <div className="session-meter" aria-label={`${Math.max(safeTotal - used, 0)} of ${safeTotal} sessions remaining`}>
      <div className="session-dots">
        {Array.from({ length: safeTotal }).map((_, index) => <span className={index < used ? 'used' : ''} key={index} />)}
      </div>
      <span>{Math.max(safeTotal - used, 0)} left</span>
    </div>
  );
}

function ClientForm({ client, onClose, onSave, saving }) {
  const [form, setForm] = useState(client ? { ...client, next_session: client.next_session?.slice(0, 16) || '' } : emptyClient);

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'package_name') {
        next.sessions_total = packageOptions[value].sessions;
        next.sessions_used = Math.min(next.sessions_used, next.sessions_total);
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      sessions_total: Number(form.sessions_total),
      sessions_used: Number(form.sessions_used),
      next_session: form.next_session ? new Date(form.next_session).toISOString() : null,
      email: form.email || null,
      payment_due_date: form.payment_due_date || null,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Client record</p>
            <h2 id="client-form-title">{client ? 'Edit client' : 'Add a new client'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X /></button>
        </header>
        <form onSubmit={submit} className="client-form">
          <div className="form-grid">
            <label className="field span-two">Full name<input value={form.name} onChange={(e) => update('name', e.target.value)} required /></label>
            <label className="field">Phone / WhatsApp<input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+60 12-345 6789" required /></label>
            <label className="field">Email (optional)<input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} /></label>
            <label className="field span-two">Home visit location<input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Area and address notes" /></label>
            <label className="field">Condition / focus<input value={form.condition} onChange={(e) => update('condition', e.target.value)} placeholder="e.g. Lower back pain" /></label>
            <label className="field">Package<select value={form.package_name} onChange={(e) => update('package_name', e.target.value)}>{Object.keys(packageOptions).map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className="field">Sessions completed<input type="number" min="0" max={form.sessions_total} value={form.sessions_used} onChange={(e) => update('sessions_used', e.target.value)} /></label>
            <label className="field">Status<select value={form.status} onChange={(e) => update('status', e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></label>
            <label className="field">Next visit<input type="datetime-local" value={form.next_session || ''} onChange={(e) => update('next_session', e.target.value)} /></label>
            <label className="field">Payment due<input type="date" value={form.payment_due_date || ''} onChange={(e) => update('payment_due_date', e.target.value)} /></label>
            <label className="field span-two">Usual schedule<input value={form.schedule} onChange={(e) => update('schedule', e.target.value)} placeholder="e.g. Tuesdays, 9:00 AM" /></label>
            <label className="field span-two">Private notes<textarea rows="3" value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Treatment reminders, accessibility notes, follow-ups…" /></label>
          </div>
          <footer className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : client ? 'Save changes' : 'Add client'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ClientDetails({ client, onClose, onEdit, onComplete, onDelete }) {
  const remaining = Math.max(client.sessions_total - client.sessions_used, 0);
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="client-drawer" role="dialog" aria-modal="true" aria-label={`${client.name} details`}>
        <button className="icon-button drawer-close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="drawer-profile">
          <span className="avatar large">{getInitials(client.name)}</span>
          <span className={`status-pill ${client.status}`}>{client.status}</span>
          <h2>{client.name}</h2>
          <p>{client.condition || 'No treatment focus added'}</p>
        </div>
        <div className="drawer-actions">
          <a className="primary-button" href={phoneHref(client.phone)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
          <button className="secondary-button" onClick={onEdit}><Edit3 /> Edit</button>
        </div>
        <div className="detail-section">
          <h3>Contact & visit</h3>
          <p><Phone /> <a href={`tel:${client.phone}`}>{client.phone}</a></p>
          {client.email && <p><Mail /> <a href={`mailto:${client.email}`}>{client.email}</a></p>}
          <p><MapPin /> {client.location || 'No location added'}</p>
        </div>
        <div className="detail-section package-detail">
          <h3>Package progress</h3>
          <div className="detail-row"><span>{client.package_name}</span><strong>{remaining} sessions left</strong></div>
          <div className="progress-track"><span style={{ width: `${Math.min((client.sessions_used / client.sessions_total) * 100, 100)}%` }} /></div>
          <div className="detail-row muted"><span>{client.sessions_used} completed</span><span>{client.sessions_total} total</span></div>
          {remaining > 0 && <button className="complete-session" onClick={onComplete}><Check /> Mark one session complete</button>}
        </div>
        <div className="detail-section">
          <h3>Schedule</h3>
          <p><CalendarDays /> {client.next_session ? `${formatDate(client.next_session)} at ${formatTime(client.next_session)}` : 'No upcoming visit'}</p>
          <p><Clock3 /> {client.schedule || 'No recurring schedule'}</p>
          <p><CircleDollarSign /> Payment due {formatDate(client.payment_due_date)}</p>
        </div>
        <div className="detail-section notes-box">
          <h3>Private notes</h3>
          <p>{client.notes || 'No notes yet.'}</p>
        </div>
        <button className="delete-button" onClick={onDelete}><Trash2 /> Delete client record</button>
      </aside>
    </div>
  );
}

function Dashboard({ session }) {
  const [clients, setClients] = useState(() => {
    if (!isDemoMode) return [];
    const saved = localStorage.getItem('eissya-demo-clients');
    return saved ? JSON.parse(saved) : demoClients;
  });
  const [loading, setLoading] = useState(!isDemoMode);
  const [view, setView] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formClient, setFormClient] = useState(undefined);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemoMode) return undefined;
    let active = true;
    supabase.from('clients').select('*').order('name').then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError('Client records could not be loaded. Check the Supabase setup instructions.');
      else setClients(data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const persistDemo = (nextClients) => {
    setClients(nextClients);
    localStorage.setItem('eissya-demo-clients', JSON.stringify(nextClients));
  };

  const activeClients = clients.filter((client) => client.status === 'active');
  const upcoming = clients
    .filter((client) => client.next_session && new Date(client.next_session) >= portalNow)
    .sort((a, b) => new Date(a.next_session) - new Date(b.next_session));
  const paymentAlerts = activeClients.filter((client) => daysUntil(client.payment_due_date) <= 7);
  const sessionsLeft = activeClients.reduce((sum, client) => sum + Math.max(client.sessions_total - client.sessions_used, 0), 0);

  const visibleClients = useMemo(() => clients.filter((client) => {
    const haystack = `${client.name} ${client.phone} ${client.condition} ${client.package_name}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (statusFilter === 'all' || client.status === statusFilter);
  }), [clients, search, statusFilter]);

  const saveClient = async (payload) => {
    setSaving(true);
    setError('');
    if (isDemoMode) {
      const next = payload.id
        ? clients.map((client) => client.id === payload.id ? payload : client)
        : [...clients, { ...payload, id: `demo-${Date.now()}` }];
      persistDemo(next);
      setFormClient(undefined);
      if (payload.id) setSelectedClient(payload);
      setSaving(false);
      return;
    }

    const record = { ...payload, owner_id: session.user.id };
    const { data, error: mutationError } = payload.id
      ? await supabase.from('clients').update(record).eq('id', payload.id).select().single()
      : await supabase.from('clients').insert(record).select().single();
    if (mutationError) setError(mutationError.message);
    else {
      setClients((current) => payload.id ? current.map((client) => client.id === data.id ? data : client) : [...current, data]);
      setSelectedClient(payload.id ? data : selectedClient);
      setFormClient(undefined);
    }
    setSaving(false);
  };

  const completeSession = async (client) => {
    const updated = { ...client, sessions_used: Math.min(client.sessions_used + 1, client.sessions_total) };
    await saveClient(updated);
    setSelectedClient(updated);
  };

  const deleteClient = async (client) => {
    if (!window.confirm(`Delete ${client.name}'s record? This cannot be undone.`)) return;
    if (isDemoMode) persistDemo(clients.filter((item) => item.id !== client.id));
    else {
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', client.id);
      if (deleteError) { setError(deleteError.message); return; }
      setClients((current) => current.filter((item) => item.id !== client.id));
    }
    setSelectedClient(null);
  };

  const signOut = async () => {
    if (!isDemoMode) await supabase.auth.signOut();
    window.location.assign('/');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users, count: activeClients.length },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays, count: upcoming.length },
  ];

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">Eissya<span>•</span>Physio</div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <p className="workspace-label">Practice workspace</p>
        <nav>
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button className={view === id ? 'active' : ''} onClick={() => { setView(id); setMenuOpen(false); }} key={id}>
              <Icon aria-hidden="true" /><span>{label}</span>{count !== undefined && <b>{count}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-support">
          <div className="support-icon"><Activity /></div>
          <strong>Built for calm care</strong>
          <p>Everything you need for the week, in one view.</p>
        </div>
        <div className="sidebar-account">
          <span className="avatar">NE</span>
          <div><strong>Nur Siti Eissya</strong><span>Physiotherapist</span></div>
          <button className="icon-button" onClick={signOut} aria-label="Sign out"><LogOut /></button>
        </div>
      </aside>
      {menuOpen && <button className="mobile-overlay" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="topbar-search">
            <Search aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setView('clients')} placeholder="Search clients, conditions or packages…" />
          </div>
          <button className="primary-button" onClick={() => setFormClient(null)}><Plus /> <span>Add client</span></button>
        </header>

        <div className="content-wrap">
          {error && <div className="page-error" role="alert">{error}<button onClick={() => setError('')}><X /></button></div>}

          {view === 'overview' && (
            <>
              <section className="welcome-row">
                <div><p className="eyebrow">{formatDate(portalNow)}</p><h1>Good {portalNow.getHours() < 12 ? 'morning' : portalNow.getHours() < 18 ? 'afternoon' : 'evening'}, Eissya.</h1><p>Here’s what needs your attention today.</p></div>
                <div className="today-chip"><CalendarDays /><span><b>{upcoming.filter((client) => new Date(client.next_session).toDateString() === portalNow.toDateString()).length}</b> visits today</span></div>
              </section>

              <section className="metrics-grid">
                <MetricCard icon={Users} label="Active clients" value={activeClients.length} helper={`${clients.filter((c) => c.status === 'completed').length} completed programmes`} tone="pink" />
                <MetricCard icon={CalendarDays} label="Upcoming visits" value={upcoming.length} helper={`${upcoming.filter((c) => daysUntil(c.next_session?.slice(0, 10)) <= 7).length} in the next 7 days`} tone="blue" />
                <MetricCard icon={PackageCheck} label="Sessions remaining" value={sessionsLeft} helper="Across active packages" tone="green" />
                <MetricCard icon={CircleDollarSign} label="Payments due soon" value={paymentAlerts.length} helper="Within 7 days or overdue" tone="yellow" />
              </section>

              <section className="overview-grid">
                <article className="panel schedule-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Coming up</p><h2>Next visits</h2></div><button onClick={() => setView('schedule')}>View schedule <ChevronRight /></button></div>
                  {upcoming.slice(0, 4).length ? <div className="appointment-list">
                    {upcoming.slice(0, 4).map((client, index) => (
                      <button className="appointment-row" key={client.id} onClick={() => setSelectedClient(client)}>
                        <div className="date-tile"><span>{formatDate(client.next_session, { weekday: 'short' }).split(',')[0]}</span><strong>{new Date(client.next_session).getDate()}</strong></div>
                        <span className={`timeline-dot color-${index % 4}`} />
                        <div className="appointment-person"><strong>{client.name}</strong><span>{client.condition || client.package_name}</span></div>
                        <div className="appointment-meta"><strong>{formatTime(client.next_session)}</strong><span>{client.location || 'Home visit'}</span></div>
                        <ChevronRight className="row-arrow" />
                      </button>
                    ))}
                  </div> : <EmptyState icon={CalendarDays} title="No visits scheduled" copy="Add a visit date to a client to see it here." />}
                </article>

                <article className="panel attention-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Follow up</p><h2>Needs attention</h2></div><span className="alert-count">{paymentAlerts.length}</span></div>
                  <div className="attention-list">
                    {paymentAlerts.slice(0, 4).map((client) => {
                      const days = daysUntil(client.payment_due_date);
                      return <button key={client.id} onClick={() => setSelectedClient(client)}>
                        <span className="avatar small">{getInitials(client.name)}</span>
                        <span><strong>{client.name}</strong><small>{days < 0 ? `Payment ${Math.abs(days)}d overdue` : days === 0 ? 'Payment due today' : `Payment due in ${days}d`}</small></span>
                        <ChevronRight />
                      </button>;
                    })}
                    {!paymentAlerts.length && <EmptyState icon={Check} title="All caught up" copy="No urgent package renewals or payments." />}
                  </div>
                </article>
              </section>

              <ClientTable clients={visibleClients.slice(0, 5)} title="Client overview" onSelect={setSelectedClient} onViewAll={() => setView('clients')} loading={loading} />
            </>
          )}

          {view === 'clients' && (
            <>
              <PageHeading eyebrow="Client care" title="Clients" copy="Manage contact details, packages, visits and treatment notes." action={<button className="primary-button" onClick={() => setFormClient(null)}><Plus /> Add client</button>} />
              <div className="list-toolbar">
                <div className="inline-search"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" /></div>
                <label className="filter-select"><span>Status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All clients</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select><ChevronDown /></label>
              </div>
              <ClientTable clients={visibleClients} onSelect={setSelectedClient} loading={loading} />
            </>
          )}

          {view === 'schedule' && (
            <>
              <PageHeading eyebrow="Appointments" title="Schedule" copy="Your upcoming home visits, sorted chronologically." />
              <section className="panel full-schedule">
                {upcoming.length ? upcoming.map((client) => (
                  <button className="schedule-card" key={client.id} onClick={() => setSelectedClient(client)}>
                    <div className="schedule-date"><span>{formatDate(client.next_session, { weekday: 'long' }).split(',')[0]}</span><strong>{new Date(client.next_session).getDate()}</strong><small>{formatDate(client.next_session, { month: 'long' }).split(' ')[1]}</small></div>
                    <div className="schedule-time"><Clock3 /><strong>{formatTime(client.next_session)}</strong><span>1 hour</span></div>
                    <span className="avatar">{getInitials(client.name)}</span>
                    <div className="schedule-client"><strong>{client.name}</strong><span>{client.condition || client.package_name}</span><small><MapPin /> {client.location || 'Home visit'}</small></div>
                    <div className="schedule-package"><span>{client.package_name}</span><small>{Math.max(client.sessions_total - client.sessions_used, 0)} sessions left</small></div>
                    <ChevronRight />
                  </button>
                )) : <EmptyState icon={CalendarDays} title="No upcoming visits" copy="Edit a client record to schedule their next session." />}
              </section>
            </>
          )}
        </div>
      </main>

      {formClient !== undefined && <ClientForm client={formClient} onClose={() => setFormClient(undefined)} onSave={saveClient} saving={saving} />}
      {selectedClient && formClient === undefined && <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} onEdit={() => setFormClient(selectedClient)} onComplete={() => completeSession(selectedClient)} onDelete={() => deleteClient(selectedClient)} />}
    </div>
  );
}

function PageHeading({ eyebrow, title, copy, action }) {
  return <section className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>{action}</section>;
}

function EmptyState({ icon: Icon, title, copy }) {
  return <div className="empty-state"><span><Icon /></span><strong>{title}</strong><p>{copy}</p></div>;
}

function ClientTable({ clients, title, onSelect, onViewAll, loading }) {
  return (
    <section className="panel client-panel">
      {(title || onViewAll) && <div className="panel-heading"><div><p className="eyebrow">At a glance</p><h2>{title}</h2></div>{onViewAll && <button onClick={onViewAll}>View all clients <ChevronRight /></button>}</div>}
      {loading ? <div className="table-loading">Loading client records…</div> : clients.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Package</th><th>Sessions</th><th>Next visit</th><th>Payment</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{clients.map((client) => {
              const due = daysUntil(client.payment_due_date);
              return <tr key={client.id} onClick={() => onSelect(client)}>
                <td><div className="client-cell"><span className="avatar">{getInitials(client.name)}</span><span><strong>{client.name}</strong><small>{client.condition || client.phone}</small></span></div></td>
                <td><span className={`package-pill ${client.package_name.toLowerCase().replaceAll(' ', '-')}`}>{client.package_name}</span></td>
                <td><SessionDots total={client.sessions_total} used={client.sessions_used} /></td>
                <td><strong className="cell-date">{client.next_session ? formatDate(client.next_session, { year: undefined }) : 'Not scheduled'}</strong><small>{client.next_session ? formatTime(client.next_session) : client.schedule}</small></td>
                <td><span className={`payment-state ${due < 0 ? 'overdue' : due <= 7 ? 'soon' : ''}`}>{due < 0 ? 'Overdue' : due === 0 ? 'Due today' : due <= 7 ? `In ${due} days` : formatDate(client.payment_due_date, { year: undefined })}</span></td>
                <td><button className="icon-button more-button" onClick={(e) => { e.stopPropagation(); onSelect(client); }} aria-label={`Open ${client.name}`}><MoreHorizontal /></button></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      ) : <EmptyState icon={UserRound} title="No clients found" copy="Try another search or add a new client." />}
    </section>
  );
}

export default Dashboard;
