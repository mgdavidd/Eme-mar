import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  CreditCard,
  Search,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import styles from "./Movements.module.css";

const formatDateMinus4 = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString.replace(" ", "T"));
  date.setHours(date.getHours() - 5);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function Movements() {
  const [activeTab, setActiveTab] = useState("movements");
  const [movements, setMovements] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPaymentsDetailModal, setShowPaymentsDetailModal] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [saleForm, setSaleForm] = useState({
    client_id: 0,
    items: [],
    is_credit: false
  });

  const [paymentForm, setPaymentForm] = useState({
    credit_sale_id: "",
    amount: 0
  });

  const [adjustForm, setAdjustForm] = useState({
    amount: "",
    description: ""
  });

  const [saleItem, setSaleItem] = useState({
    product_id: "",
    quantity: ""
  });

  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [paymentsDetail, setPaymentsDetail] = useState([]);

  useEffect(() => {
    loadMovements();
    loadCreditSales();
    loadClients();
    loadProducts();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 4000);
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://server-eme-mar.onrender.com/moves");
      const data = await res.json();
      setMovements(data || []);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCreditSales = async () => {
    try {
      const res = await fetch("https://server-eme-mar.onrender.com/moves/credit/sales");
      const data = await res.json();
      setCreditSales(data || []);
    } catch (error) {
      console.error("Error al cargar ventas a crédito:", error);
      setCreditSales([]);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch("https://server-eme-mar.onrender.com/clients");
      const data = await res.json();
      setClients(data || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClients([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("https://server-eme-mar.onrender.com/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
    }
  };

  const handleCreateSale = async () => {
    if (!(saleForm.client_id > 0) || saleForm.items.length === 0) {
      showAlert("warning", "Selecciona un cliente y agrega al menos un producto");
      return;
    }

    try {
      const res = await fetch("https://server-eme-mar.onrender.com/moves/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleForm)
      });

      if (res.ok) {
        loadMovements();
        loadCreditSales();
        setShowSaleModal(false);
        setSaleForm({ client_id: 0, items: [], is_credit: false });
        showAlert("success", saleForm.is_credit ? "Venta a crédito creada exitosamente" : "Venta registrada exitosamente");
      } else {
        const error = await res.json();
        showAlert("error", error.error || "Error al crear venta");
      }
    } catch (error) {
      showAlert("error", "Error al crear venta");
      console.log(error)
    }
  };

  const handlePayCredit = async () => {
    if (!paymentForm.credit_sale_id || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showAlert("warning", "Ingresa un monto válido");
      return;
    }

    try {
      const res = await fetch("https://server-eme-mar.onrender.com/moves/pay/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm)
      });

      if (res.ok) {
        loadMovements();
        loadCreditSales();
        setShowPaymentModal(false);
        setPaymentForm({ credit_sale_id: "", amount: "" });
        showAlert("success", "Abono registrado exitosamente");
      } else {
        const error = await res.json();
        showAlert("error", error.error || "Error al procesar abono");
      }
    } catch (error) {
      showAlert("error", "Error al procesar abono");
      console.log(error)
    }
  };

  const handleAdjustBalance = async () => {
    if (!adjustForm.amount || !adjustForm.description.trim()) {
      showAlert("warning", "Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("https://server-eme-mar.onrender.com/moves/adjust/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustForm)
      });

      if (res.ok) {
        loadMovements();
        setShowAdjustModal(false);
        setAdjustForm({ amount: "", description: "" });
        showAlert("success", "Saldo ajustado exitosamente");
      } else {
        const error = await res.json();
        showAlert("error", error.error || "Error al ajustar saldo");
      }
    } catch (error) {
      showAlert("error", "Error al ajustar saldo");
      console.log(error)
    }
  };

  const handleAddProductToSale = () => {
    if (!saleItem.product_id || !saleItem.quantity) {
      showAlert("warning", "Selecciona un producto y cantidad");
      return;
    }

    setSaleForm({
      ...saleForm,
      items: [...saleForm.items, {
        product_id: parseInt(saleItem.product_id),
        quantity: parseInt(saleItem.quantity)
      }]
    });

    setSaleItem({ product_id: "", quantity: "" });
  };

  const handleViewPayments = async (creditSale) => {
    try {
      const res = await fetch(`https://server-eme-mar.onrender.com/moves/credit/payments/${creditSale.sale_id}`);
      const data = await res.json();
      setPaymentsDetail(data || []);
      setSelectedCreditSale(creditSale);
      setShowPaymentsDetailModal(true);
    } catch (error) {
      showAlert("error", "Error al cargar pagos");
      console.log(error)
    }
  };

  const filteredMovements = movements.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return m.descripcion?.toLowerCase().includes(searchLower);
  });

  const filteredCreditSales = creditSales.filter(cs => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cs.description?.toLowerCase().includes(searchLower) ||
      cs.client_name?.toLowerCase().includes(searchLower)
    );
  });

  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product ? product.name : "Producto desconocido";
  };

  const getMovementIcon = (movement) => {
    if (movement.descripcion?.includes("Abono a crédito")) {
      return <CreditCard className={styles.iconCredit} size={24} />;
    }
    if (movement.type === "ingreso") {
      return <TrendingUp className={styles.iconIncome} size={24} />;
    }
    return <TrendingDown className={styles.iconExpense} size={24} />;
  };

  const getAlertIcon = () => {
    switch(alert.type) {
      case "success": return <CheckCircle size={24} />;
      case "error": return <AlertCircle size={24} />;
      case "warning": return <AlertCircle size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className={styles.movements}>
      {alert.show && (
        <div className={`${styles.globalAlert} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
          {getAlertIcon()}
          <span>{alert.message}</span>
          <button onClick={() => setAlert({ show: false, type: "", message: "" })}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "movements" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("movements")}
        >
          Movimientos
        </button>
        <button
          className={`${styles.tab} ${activeTab === "credit-sales" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("credit-sales")}
        >
          Ventas a Crédito
        </button>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchContainer}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por descripción o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch} 
              onClick={() => setSearchTerm("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.btnPrimary} onClick={() => setShowSaleModal(true)}>
            <ShoppingCart size={18} />
            Nueva Venta
          </button>
          <button className={styles.btnTertiary} onClick={() => setShowAdjustModal(true)}>
            <DollarSign size={18} />
            Ajustar Caja
          </button>
        </div>
      </div>

      {activeTab === "movements" ? (
        <div className={styles.movementsList}>
          {loading ? (
            <div className={styles.loading}>Cargando movimientos...</div>
          ) : filteredMovements.length === 0 ? (
            <div className={styles.empty}>No hay movimientos registrados</div>
          ) : (
            filteredMovements.map((movement) => (
              <div key={movement.id} className={styles.movementCard}>
                <div className={styles.movementIcon}>
                  {getMovementIcon(movement)}
                </div>

                <div className={styles.movementContent}>
                  <p className={styles.movementDescription}>{movement.descripcion}</p>

                  {/* FECHA CORREGIDA */}
                  <p className={styles.movementDate}>{formatDateMinus4(movement.date)}</p>
                </div>

                <div className={`${styles.movementAmount} ${
                  movement.type === "ingreso" ? styles.amountIncome : styles.amountExpense
                }`}>
                  {movement.type === "ingreso" ? "+" : "-"}{movement.amount.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.creditSalesList}>
          {filteredCreditSales.length === 0 ? (
            <div className={styles.empty}>No hay ventas a crédito</div>
          ) : (
            filteredCreditSales.map((sale) => {
              const remaining = sale.total - sale.total_paid;
              const isPaid = remaining <= 0.01;

              return (
                <div key={sale.sale_id} className={styles.creditSaleCard}>
                  <div className={styles.creditSaleHeader}>
                    <div>
                      <h4 className={styles.creditSaleClient}>{sale.client_name}</h4>

                      {/* FECHA CORREGIDA */}
                      <p className={styles.creditSaleDate}>{formatDateMinus4(sale.date)}</p>
                    </div>
                    {isPaid && (
                      <span className={styles.paidBadge}>
                        <CheckCircle size={14} />
                        Pagado
                      </span>
                    )}
                  </div>

                  <div className={styles.creditSaleDescription}>
                    {sale.description}
                  </div>

                  <div className={styles.creditSaleAmounts}>
                    <div className={styles.amountRow}>
                      <span>Total:</span>
                      <span>{sale.total.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
                    </div>
                    <div className={styles.amountRow}>
                      <span>Pagado:</span>
                      <span className={styles.paidAmount}>{sale.total_paid.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
                    </div>
                    <div className={`${styles.amountRow} ${styles.amountRowPending}`}>
                      <span>Pendiente:</span>
                      <span className={styles.pendingAmount}>{remaining.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
                    </div>
                  </div>

                  <div className={styles.creditSaleActions}>
                    <button
                      className={styles.btnViewPayments}
                      onClick={() => handleViewPayments(sale)}
                    >
                      Ver Pagos
                    </button>
                    {!isPaid && (
                      <button
                        className={styles.btnPayCredit}
                        onClick={() => {
                          setPaymentForm({ credit_sale_id: sale.sale_id, amount: "" });
                          setShowPaymentModal(true);
                        }}
                      >
                        Abonar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showSaleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSaleModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <ShoppingCart size={20} />
                Nueva Venta
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowSaleModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Cliente *</label>
                <select
                  value={saleForm.client_id}
                  onChange={(e) => setSaleForm({ ...saleForm, client_id: parseInt(e.target.value) })}
                  className={styles.formInput}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c => (
                    <option key={parseInt(c.id)} value={parseInt(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={saleForm.is_credit}
                    onChange={(e) => setSaleForm({ ...saleForm, is_credit: e.target.checked })}
                  />
                  <span>Venta a crédito</span>
                </label>
              </div>

              <div className={styles.addProductSection}>
                <h4>Agregar Productos</h4>
                <div className={styles.productInputs}>
                  <select
                    value={saleItem.product_id}
                    onChange={(e) => setSaleItem({ ...saleItem, product_id: e.target.value })}
                    className={styles.formInput}
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={saleItem.quantity}
                    onChange={(e) => setSaleItem({ ...saleItem, quantity: e.target.value })}
                    className={styles.formInput}
                  />

                  <button className={styles.btnAdd} onClick={handleAddProductToSale}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {saleForm.items.length > 0 && (
                <div className={styles.productList}>
                  <h4>Productos Agregados:</h4>
                  {saleForm.items.map((item, index) => (
                    <div key={index} className={styles.productItem}>
                      <span>{getProductName(item.product_id)} x {item.quantity}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => setSaleForm({
                          ...saleForm,
                          items: saleForm.items.filter((_, i) => i !== index)
                        })}
                      >
                        <X size={106} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowSaleModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handleCreateSale}>
                Crear Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <CreditCard size={20} />
                Abonar a Crédito
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Monto a Abonar *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handlePayCredit}>
                Abonar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAdjustModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <DollarSign size={20} />
                Ajustar Saldo de Caja
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowAdjustModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nuevo Saldo *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: parseFloat(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descripción *</label>
                <textarea
                  placeholder="Motivo del ajuste..."
                  value={adjustForm.description}
                  onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowAdjustModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handleAdjustBalance}>
                Ajustar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentsDetailModal && selectedCreditSale && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentsDetailModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <CreditCard size={20} />
                Historial de Pagos - {selectedCreditSale.client_name}
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowPaymentsDetailModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {paymentsDetail.length === 0 ? (
                <p className={styles.empty}>No hay pagos registrados</p>
              ) : (
                <div className={styles.paymentsList}>
                  {paymentsDetail.map(payment => (
                    <div key={payment.id} className={styles.paymentItem}>
                      <CreditCard size={20} className={styles.paymentIcon} />
                      <div className={styles.paymentInfo}>

                        {/* FECHA CORREGIDA */}
                        <span className={styles.paymentDate}>{formatDateMinus4(payment.date)}</span>

                        <span className={styles.amount}>
                          {payment.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowPaymentsDetailModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
