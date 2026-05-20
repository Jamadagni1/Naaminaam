const { useCallback, useEffect, useMemo, useRef, useState } = React;

function safeJsonParse(value, fallback) {
  try {
    if (value == null) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    const raw = window.localStorage.getItem(key);
    const parsed = safeJsonParse(raw, null);
    return parsed ?? initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function useWishlist(storageKey = "wishlist_v1") {
  const [items, setItems] = useLocalStorageState(storageKey, []);

  const idSet = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const isFavorite = useCallback((id) => idSet.has(id), [idSet]);

  const addFavorite = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, [setItems]);

  const removeFavorite = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, [setItems]);

  const toggleFavorite = useCallback((item) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.filter((p) => p.id !== item.id) : [item, ...prev];
    });
  }, [setItems]);

  const clearFavorites = useCallback(() => setItems([]), [setItems]);

  return {
    items,
    count: items.length,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  };
}

function HeartIcon({ filled, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
      />
    </svg>
  );
}

function WishlistIcon({ count, onClick, active }) {
  const filled = active || count > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open wishlist"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
      <HeartIcon
        filled={filled}
        className={filled ? "h-5 w-5 text-red-500" : "h-5 w-5 text-slate-700"}
      />
      <span className="sr-only">Wishlist</span>
      <span
        aria-label={`${count} saved`}
        className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-xs font-semibold leading-none text-white"
      >
        {count}
      </span>
    </button>
  );
}

function WishlistItem({ item, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <img
        src={item.image}
        alt={item.title}
        className="h-12 w-12 rounded-lg object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
        <div className="truncate text-xs text-slate-500">{item.id}</div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from wishlist`}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        Remove
      </button>
    </div>
  );
}

function WishlistDrawer({ open, items, onClose, onRemove, onClear }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus?.();
    }
  }, [open]);

  return (
    <div
      className={[
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      <div
        className={[
          "absolute inset-0 bg-slate-900/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist drawer"
        tabIndex={-1}
        ref={panelRef}
        className={[
          "absolute right-0 top-0 h-full w-[min(420px,92vw)] bg-white shadow-2xl outline-none",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Wishlist</h2>
            <p className="text-sm text-slate-500">Saved items ({items.length})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:shadow focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Close
          </button>
        </div>

        <div className="flex h-[calc(100%-76px)] flex-col">
          <div className="flex-1 space-y-3 overflow-auto p-5">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <HeartIcon filled={false} className="h-6 w-6 text-slate-600" />
                </div>
                <div className="text-sm font-semibold text-slate-900">No favorites yet</div>
                <div className="mt-1 text-xs text-slate-500">
                  Tap the heart on any card to save it.
                </div>
              </div>
            ) : (
              items.map((item) => (
                <WishlistItem key={item.id} item={item} onRemove={onRemove} />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-5">
            <button
              type="button"
              onClick={onClear}
              disabled={items.length === 0}
              aria-label="Clear all favorites"
              className={[
                "w-full rounded-xl border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-500",
                items.length === 0
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
              ].join(" ")}
            >
              Clear All
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FavoriteToggleButton({ active, onToggle, title }) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(false), 250);
    return () => clearTimeout(t);
  }, [pop]);

  return (
    <button
      type="button"
      onClick={() => {
        setPop(true);
        onToggle();
      }}
      aria-label={active ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition",
        "focus:outline-none focus:ring-2 focus:ring-violet-500",
        active ? "border-red-200" : "border-slate-200 hover:shadow",
        pop ? "animate-heart-pop" : "",
      ].join(" ")}
    >
      <HeartIcon
        filled={active}
        className={active ? "h-5 w-5 text-red-500" : "h-5 w-5 text-slate-700"}
      />
    </button>
  );
}

function DemoCard({ item, isFavorite, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute right-3 top-3">
          <FavoriteToggleButton
            active={isFavorite}
            onToggle={onToggle}
            title={item.title}
          />
        </div>
      </div>
      <div className="p-4">
        <div className="text-base font-extrabold text-slate-900">{item.title}</div>
        <div className="mt-1 text-sm text-slate-500">ID: {item.id}</div>
      </div>
    </div>
  );
}

function Header({ wishlistCount, onOpenDrawer }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="text-lg font-black tracking-tight">
          Naam<span className="text-violet-600">in</span>
        </div>
        <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-700 md:flex">
          <a className="rounded-lg px-3 py-2 hover:bg-slate-50" href="#">
            Home
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-slate-50" href="#">
            About
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-slate-50" href="#">
            More
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle language"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-violet-500 sm:inline-flex"
          >
            ENG/HIN
          </button>
          <WishlistIcon count={wishlistCount} onClick={onOpenDrawer} active={false} />
          <button
            type="button"
            aria-label="Login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Log in
          </button>
          <button
            type="button"
            aria-label="Sign up"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const wishlist = useWishlist("naamin_wishlist_v1");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const demoItems = useMemo(
    () => [
      { id: "baby-aarav", title: "Aarav", image: "baby_aarav_1768672098297.png" },
      { id: "baby-ananya", title: "Ananya", image: "baby_ananya_1768672114695.png" },
      { id: "baby-vihaan", title: "Vihaan", image: "baby_vihaan_1768672167983.png" },
      { id: "baby-saanvi", title: "Saanvi", image: "baby_saanvi_1768672196713.png" },
    ],
    []
  );

  const onToggle = useCallback(
    (item) => {
      wishlist.toggleFavorite(item);
    },
    [wishlist]
  );

  return (
    <div>
      <Header wishlistCount={wishlist.count} onOpenDrawer={() => setDrawerOpen(true)} />

      <WishlistDrawer
        open={drawerOpen}
        items={wishlist.items}
        onClose={() => setDrawerOpen(false)}
        onRemove={wishlist.removeFavorite}
        onClear={wishlist.clearFavorites}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Favorites Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Click hearts to toggle favorites. The header badge updates instantly and the right drawer
            reads from localStorage.
          </p>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demoItems.map((item) => (
            <DemoCard
              key={item.id}
              item={item}
              isFavorite={wishlist.isFavorite(item.id)}
              onToggle={() => onToggle(item)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

