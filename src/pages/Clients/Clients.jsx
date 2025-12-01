import React, { useState } from "react";
import { Plus, FileText, Trash2, Pencil, Search, TrendingDown, TrendingUp } from "lucide-react";
import styles from "./Clients.module.css";
import Alert from "../../components/Alert";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [historyTab, setHistoryTab] = useState("movements");
  const [clientMovements, setClientMovements] = useState([]);
  const [clientCreditSales, setClientCreditSales] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados para abonos
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    phone: "",
    debt: 0,
  });

  React.useEffect(() => {
    fetch("https://server-eme-mar.onrender.com/clients")
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({ id: null, name: "", phone: "", debt: 0 });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditMode(true);
    setFormData({
      id: client.id,
      name: client.name,
      phone: client.phone,
      debt: client.debt,
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  //  CREATE OR UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      phone: formData.phone,
      debt: parseFloat(formData.debt),
    };

    if (!editMode) {
      // CREATE
      const res = await fetch(`https://server-eme-mar.onrender.com/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const created = await res.json();
      setClients([...clients, created]);
    } else {
      // UPDATE
      const res = await fetch(`https://server-eme-mar.onrender.com/clients/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();
      setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    }

    closeModal();
  };

  // =====================================================
  //  DELETE
  // =====================================================
  const confirmDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteAlert(true);
  };

  const deleteClient = async () => {
    if (!clientToDelete) return;

    await fetch(`https://server-eme-mar.onrender.com/clients/${clientToDelete.id}`, {
      method: "DELETE",
    });

    setClients(clients.filter((c) => c.id !== clientToDelete.id));
    setShowDeleteAlert(false);
  };

  // =====================================================
  //  VER HISTORIAL (CON ENDPOINT ESPECÍFICO)
  // =====================================================
  const handleVerHistorial = async (client) => {
    setSelectedClient(client);
    setShowHistoryModal(true);
    setLoadingHistory(true);

    try {
      // Cargar movimientos específicos del cliente usando el endpoint correcto
      const movesRes = await fetch(`https://server-eme-mar.onrender.com/moves/client/${client.id}`);
      const movesData = await movesRes.json();
      setClientMovements(movesData || []);

      // Cargar ventas a crédito del cliente
      const creditRes = await fetch(`https://server-eme-mar.onrender.com/moves/credit/client/${client.id}`);
      const creditData = await creditRes.json();
      setClientCreditSales(creditData || []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setClientMovements([]);
      setClientCreditSales([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // =====================================================
  //  FUNCIONES PARA ABONOS
  // =====================================================
  const handleOpenPaymentModal = (sale) => {
    const remaining = sale.total - sale.total_paid;
    setSelectedCreditSale(sale);
    setPaymentAmount(remaining > 0 ? remaining.toFixed(2) : "");
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedCreditSale || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await fetch("https://server-eme-mar.onrender.com/moves/pay/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credit_sale_id: selectedCreditSale.sale_id,
          amount: parseFloat(paymentAmount),
        }),
      });

      if (response.ok) {
        // Recargar historial
        await handleVerHistorial(selectedClient);
        // Recargar lista de clientes para actualizar deuda
        const clientsRes = await fetch("https://server-eme-mar.onrender.com/clients");
        const clientsData = await clientsRes.json();
        setClients(clientsData);
        
        setShowPaymentModal(false);
        setSelectedCreditSale(null);
        setPaymentAmount("");
      } else {
        const error = await response.json();
        alert(error.message || "Error al procesar el abono");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      alert("Error al procesar el abono");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getMovementIcon = (movement) => {
    if (movement.descripcion?.includes("Abono a crédito")) {
      return "💳";
    }
    if (movement.type === "ingreso") {
      return <TrendingUp size={24} strokeWidth={2} />;
    }
    return <TrendingDown size={24} strokeWidth={2} />;
  };

  // =====================================================
  //  RENDER
  // =====================================================
  return (
    <div className={styles.clientesContainer}>
      {/* Header */}
      <div className={styles.clientesHeader}>
        <h2 className={styles.clientesTitle}>Clientes</h2>

        <button className={styles.createButton} onClick={openCreateModal}>
          <Plus size={20} strokeWidth={2.5} />
          <span>Crear cliente</span>
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={25} strokeWidth={2}  />
      </div>

      {/* Lista */}
      <div className={styles.clientesList}>
        {clients
          .filter((c) => {
            const text = search.toLowerCase();
            return (
              c.name.toLowerCase().includes(text) || c.phone.includes(text)
            );
          })
          .map((cliente) => (
            <div key={cliente.id} className={styles.clienteCard}>
              <div className={styles.clienteInfo}>
                <h3 className={styles.clienteNombre}>{cliente.name}</h3>
                <p className={styles.clienteTelefono}>
                  <span className={styles.telefonoLabel}>Teléfono: </span>
                  {cliente.phone}
                </p>
              </div>

              <div className={styles.clienteDeuda}>
                <span className={styles.deudaLabel}>Deuda:</span>
                <span
                  className={`${styles.deudaAmount} ${
                    cliente.debt > 0 ? styles.deudaActive : styles.deudaNone
                  }`}
                >
                  $ {cliente.debt.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Botones (3 acciones) */}
              <div className={styles.accionesContainer}>
                <button
                  className={styles.ventasButton}
                  onClick={() => handleVerHistorial(cliente)}
                  title="Ver historial completo"
                >
                  <FileText size={22} strokeWidth={2} />
                </button>

                <button
                  className={styles.ventasButton}
                  onClick={() => confirmDeleteClient(cliente)}
                  title="Eliminar cliente"
                >
                  <Trash2 size={22} strokeWidth={2} />
                </button>

                <button
                  className={styles.ventasButton}
                  onClick={() => openEditModal(cliente)}
                  title="Actualizar cliente"
                >
                  <Pencil size={22} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* === MODAL CREAR / EDITAR === */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>
              {editMode ? "Actualizar Cliente" : "Crear Cliente"}
            </h3>

            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <input
                name="name"
                type="text"
                placeholder="Nombre"
                className={styles.modalInput}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                type="text"
                placeholder="Teléfono"
                className={styles.modalInput}
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                name="debt"
                type="number"
                step="0.01"
                min="0"
                placeholder="Deuda"
                className={styles.modalInput}
                value={formData.debt}
                onChange={handleChange}
              />

              <button type="submit" className={styles.modalButton}>
                {editMode ? "Actualizar" : "Crear"}
              </button>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === ALERTA ELIMINAR === */}
      {showDeleteAlert && (
        <Alert
          type="warning"
          onClose={() => setShowDeleteAlert(false)}
          message={
            <div style={{ textAlign: "center" }}>
              <p>
                ¿Eliminar <strong>{clientToDelete?.name}</strong>?
              </p>

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={deleteClient}
                  style={{
                    padding: "8px 14px",
                    background: "#d9534f",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>

                <button
                  onClick={() => setShowDeleteAlert(false)}
                  style={{
                    padding: "8px 14px",
                    background: "#e0d4c4",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* === MODAL HISTORIAL === */}
      {showHistoryModal && selectedClient && (
        <div className={styles.modalOverlay} onClick={() => setShowHistoryModal(false)}>
          <div
            className={styles.historyModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.historyModalHeader}>
              <h3 className={styles.historyModalTitle}>
                Historial de {selectedClient.name}
              </h3>
              <button
                className={styles.closeHistoryButton}
                onClick={() => setShowHistoryModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.historyTabs}>
              <button
                className={`${styles.historyTab} ${
                  historyTab === "movements" ? styles.historyTabActive : ""
                }`}
                onClick={() => setHistoryTab("movements")}
              >
                Movimientos
              </button>
              <button
                className={`${styles.historyTab} ${
                  historyTab === "credit" ? styles.historyTabActive : ""
                }`}
                onClick={() => setHistoryTab("credit")}
              >
                Compras a Crédito
              </button>
            </div>

            {/* Contenido */}
            <div className={styles.historyContent}>
              {loadingHistory ? (
                <div className={styles.historyLoading}>Cargando...</div>
              ) : historyTab === "movements" ? (
                <div className={styles.historyList}>
                  {clientMovements.length === 0 ? (
                    <div className={styles.historyEmpty}>
                      No hay movimientos registrados
                    </div>
                  ) : (
                    clientMovements.map((movement) => (
                      <div key={movement.id} className={styles.historyItem}>
                        <div className={styles.historyItemIcon}>
                          {getMovementIcon(movement)}
                        </div>
                        <div className={styles.historyItemContent}>
                          <p className={styles.historyItemDescription}>
                            {movement.descripcion}
                          </p>
                          <p className={styles.historyItemDate}>{movement.date}</p>
                        </div>
                        <div
                          className={`${styles.historyItemAmount} ${
                            movement.type === "ingreso"
                              ? styles.historyAmountIncome
                              : styles.historyAmountExpense
                          }`}
                        >
                          {movement.type === "ingreso" ? "+" : "-"}$
                          {movement.amount.toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className={styles.historyList}>
                  {clientCreditSales.length === 0 ? (
                    <div className={styles.historyEmpty}>
                      No hay ventas a crédito
                    </div>
                  ) : (
                    clientCreditSales.map((sale) => {
                      const remaining = sale.total - sale.total_paid;
                      const isPaid = remaining <= 0.01;

                      return (
                        <div key={sale.sale_id} className={styles.creditSaleItem}>
                          <div className={styles.creditSaleItemHeader}>
                            <span className={styles.creditSaleItemDate}>
                              {sale.date}
                            </span>
                            {isPaid ? (
                              <span className={styles.creditPaidBadge}>✓ Pagado</span>
                            ) : (
                              <button
                                className={styles.payButton}
                                onClick={() => handleOpenPaymentModal(sale)}
                                title="Realizar abono"
                              >
                                Abonar
                              </button>
                            )}
                          </div>
                          <div className={styles.creditSaleItemDescription}>
                            {sale.description}
                          </div>
                          <div className={styles.creditSaleItemAmounts}>
                            <div className={styles.creditAmountRow}>
                              <span>Total:</span>
                              <span>${sale.total.toLocaleString("es-CO")}</span>
                            </div>
                            <div className={styles.creditAmountRow}>
                              <span>Pagado:</span>
                              <span className={styles.creditPaidAmount}>
                                ${sale.total_paid.toLocaleString("es-CO")}
                              </span>
                            </div>
                            <div
                              className={`${styles.creditAmountRow} ${styles.creditAmountRowPending}`}
                            >
                              <span>Pendiente:</span>
                              <span className={styles.creditPendingAmount}>
                                ${remaining.toLocaleString("es-CO")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DE ABONO === */}
      {showPaymentModal && selectedCreditSale && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <h3 className={styles.modalTitle}>Realizar Abono</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <p style={{ marginBottom: "8px", color: "#4a3b2e" }}>
                <strong>Cliente:</strong> {selectedClient?.name}
              </p>
              <p style={{ marginBottom: "8px", color: "#4a3b2e" }}>
                <strong>Total pendiente:</strong> $
                {((selectedCreditSale.total - selectedCreditSale.total_paid) || 0).toLocaleString("es-CO")}
              </p>
            </div>

            <div className={styles.modalForm}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedCreditSale.total - selectedCreditSale.total_paid}
                placeholder="Monto del abono"
                className={styles.modalInput}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                disabled={processingPayment}
              />

              <button
                type="button"
                className={styles.modalButton}
                onClick={handlePayment}
                disabled={processingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                style={{
                  background: processingPayment ? "#c7b091" : "#d8c3a5",
                  cursor: processingPayment ? "not-allowed" : "pointer"
                }}
              >
                {processingPayment ? "Procesando..." : "Realizar Abono"}
              </button>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCreditSale(null);
                  setPaymentAmount("");
                }}
                disabled={processingPayment}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}