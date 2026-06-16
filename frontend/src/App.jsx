import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { api } from './api'

const TABS = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
}

function money(n) {
  const num = Number(n)
  if (Number.isNaN(num)) return String(n)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
    num,
  )
}

export default function App() {
  const [tab, setTab] = useState(TABS.PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [])

  async function refreshAll() {
    setLoading(true)
    setError('')
    try {
      const [p, c, o] = await Promise.all([
        api('/products'),
        api('/customers'),
        api('/orders'),
      ])
      setProducts(p)
      setCustomers(c)
      setOrders(o)
    } catch (e) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onCreateProduct(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name') || '').trim(),
      sku: String(form.get('sku') || '').trim(),
      description: String(form.get('description') || '').trim() || null,
      price: Number(form.get('price') || 0),
      stock: Number(form.get('stock') || 0),
    }
    setLoading(true)
    setError('')
    try {
      await api('/products', { method: 'POST', body: payload })
      e.currentTarget.reset()
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateCustomer(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
    }
    setLoading(true)
    setError('')
    try {
      await api('/customers', { method: 'POST', body: payload })
      e.currentTarget.reset()
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const [orderCustomerId, setOrderCustomerId] = useState('')
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }])

  function addOrderItem() {
    setOrderItems((xs) => [...xs, { product_id: '', quantity: 1 }])
  }
  function removeOrderItem(i) {
    setOrderItems((xs) => xs.filter((_, idx) => idx !== i))
  }
  function updateOrderItem(i, patch) {
    setOrderItems((xs) => xs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  }

  async function onCreateOrder(e) {
    e.preventDefault()
    const payload = {
      customer_id: Number(orderCustomerId),
      items: orderItems
        .filter((x) => x.product_id && Number(x.quantity) > 0)
        .map((x) => ({ product_id: Number(x.product_id), quantity: Number(x.quantity) })),
    }
    setLoading(true)
    setError('')
    try {
      await api('/orders', { method: 'POST', body: payload })
      setOrderCustomerId('')
      setOrderItems([{ product_id: '', quantity: 1 }])
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">Ethara Inventory & Orders</div>
          <div className="subtitle">
            Frontend talking to <code>{apiBase}</code>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === TABS.PRODUCTS ? 'active' : ''} onClick={() => setTab(TABS.PRODUCTS)}>
            Products
          </button>
          <button className={tab === TABS.CUSTOMERS ? 'active' : ''} onClick={() => setTab(TABS.CUSTOMERS)}>
            Customers
          </button>
          <button className={tab === TABS.ORDERS ? 'active' : ''} onClick={() => setTab(TABS.ORDERS)}>
            Orders
          </button>
        </nav>
      </header>

      {error ? <div className="alert">{error}</div> : null}
      {loading ? <div className="hint">Loading…</div> : null}

      <main className="grid">
        {tab === TABS.PRODUCTS ? (
          <>
            <section className="card">
              <h2>Create product</h2>
              <form className="form" onSubmit={onCreateProduct}>
                <label>
                  Name
                  <input name="name" required />
                </label>
                <label>
                  SKU (unique)
                  <input name="sku" required />
                </label>
                <label className="full">
                  Description
                  <input name="description" />
                </label>
                <label>
                  Price
                  <input name="price" type="number" step="0.01" min="0" required />
                </label>
                <label>
                  Stock
                  <input name="stock" type="number" min="0" required />
                </label>
                <div className="actions full">
                  <button type="submit">Create</button>
                  <button type="button" className="secondary" onClick={refreshAll}>
                    Refresh
                  </button>
                </div>
              </form>
            </section>

            <section className="card">
              <h2>Products</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><code>{p.sku}</code></td>
                        <td>{p.name}</td>
                        <td>{money(p.price)}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                    {!products.length ? (
                      <tr>
                        <td colSpan="5" className="empty">No products yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {tab === TABS.CUSTOMERS ? (
          <>
            <section className="card">
              <h2>Create customer</h2>
              <form className="form" onSubmit={onCreateCustomer}>
                <label>
                  Name
                  <input name="name" required />
                </label>
                <label>
                  Email (unique)
                  <input name="email" type="email" required />
                </label>
                <div className="actions full">
                  <button type="submit">Create</button>
                  <button type="button" className="secondary" onClick={refreshAll}>
                    Refresh
                  </button>
                </div>
              </form>
            </section>

            <section className="card">
              <h2>Customers</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td><code>{c.email}</code></td>
                      </tr>
                    ))}
                    {!customers.length ? (
                      <tr>
                        <td colSpan="3" className="empty">No customers yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {tab === TABS.ORDERS ? (
          <>
            <section className="card">
              <h2>Create order</h2>
              <form className="form" onSubmit={onCreateOrder}>
                <label className="full">
                  Customer
                  <select value={orderCustomerId} onChange={(e) => setOrderCustomerId(e.target.value)} required>
                    <option value="" disabled>Select customer…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="full">
                  <div className="itemsHeader">
                    <div>Items</div>
                    <button type="button" className="secondary" onClick={addOrderItem}>
                      Add item
                    </button>
                  </div>
                  <div className="items">
                    {orderItems.map((it, idx) => (
                      <div key={idx} className="itemRow">
                        <select
                          value={it.product_id}
                          onChange={(e) => updateOrderItem(idx, { product_id: e.target.value })}
                          required
                        >
                          <option value="" disabled>Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.name} (SKU {p.sku}, stock {p.stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => updateOrderItem(idx, { quantity: e.target.value })}
                          required
                        />
                        <button type="button" className="danger" onClick={() => removeOrderItem(idx)} disabled={orderItems.length === 1}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="actions full">
                  <button type="submit">Place order</button>
                  <button type="button" className="secondary" onClick={refreshAll}>
                    Refresh
                  </button>
                </div>
              </form>
              <div className="hint">
                If stock is insufficient, the API will reject the order.
              </div>
            </section>

            <section className="card">
              <h2>Orders</h2>
              <div className="orders">
                {orders.map((o) => (
                  <div key={o.id} className="order">
                    <div className="orderTop">
                      <div>
                        <div className="orderId">Order #{o.id}</div>
                        <div className="orderMeta">
                          {o.customer?.name} ({o.customer?.email})
                        </div>
                      </div>
                      <div className="orderMeta">
                        {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="tableWrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Product ID</th>
                            <th>Qty</th>
                            <th>Unit price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items?.map((it) => (
                            <tr key={it.id}>
                              <td>{it.product_id}</td>
                              <td>{it.quantity}</td>
                              <td>{money(it.unit_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {!orders.length ? <div className="emptyBox">No orders yet.</div> : null}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}
