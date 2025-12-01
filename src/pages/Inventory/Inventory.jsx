import React, { useState, useEffect } from "react";
import InsumoCard from "../../components/InsumosCard.jsx";
import Alert from "../../components/Alert";
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [insumos, setInsumos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showSupplyAlert, setShowSupplyAlert] = useState(false);
  const [showSupplySuccessAlert, setShowSupplySuccessAlert] = useState(false);
  const [showSupplyErrorAlert, setShowSupplyErrorAlert] = useState(false);
  const [insumoToDelete, setInsumoToDelete] = useState(null);
  const [insumoToSupply, setInsumoToSupply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormAlert, setShowFormAlert] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    unit_price: "",
    um: "",
    stock: "",
    min_stock: "",
  });

  const [supplyData, setSupplyData] = useState({
    id_insumo: null,
    amount: "",
    total_amount: 0,
  });

  // =====================================================
  //  LOAD DATA
  // =====================================================
  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://server-eme-mar.onrender.com/insumos");
      const data = await res.json();
      setInsumos(data);
    } catch (error) {
      console.error("Error al cargar insumos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsumos = insumos.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =====================================================
  //  OPEN MODAL (CREATE)
  // =====================================================
  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      id: null,
      name: "",
      unit_price: "",
      um: "",
      stock: "",
      min_stock: "",
    });
    setShowModal(true);
  };

  // =====================================================
  //  OPEN MODAL (EDIT)
  // =====================================================
  const openEditModal = (insumo) => {
    setEditMode(true);
    setFormData({
      id: insumo.id,
      name: insumo.name,
      unit_price: insumo.unit_price,
      um: insumo.um,
      stock: insumo.stock,
      min_stock: insumo.min_stock,
    });
    setShowModal(true);
  };

  // =====================================================
  //  OPEN SUPPLY MODAL
  // =====================================================
  const openSupplyModal = (insumo) => {
    setInsumoToSupply(insumo);
    setSupplyData({
      id_insumo: insumo.id,
      amount: "",
      total_amount: 0,
    });
    setShowSupplyModal(true);
  };

  const closeModal = () => setShowModal(false);
  const closeSupplyModal = () => {
    setShowSupplyModal(false);
    setInsumoToSupply(null);
  };

  // =====================================================
  //  HANDLE INPUTS
  // =====================================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSupplyChange = (e) => {
    const { name, value } = e.target;
    setSupplyData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Calcular total_amount si es amount o id_insumo cambia
      if (name === "amount" && insumoToSupply) {
        const amount = parseFloat(value) || 0;
        updated.total_amount = amount * insumoToSupply.unit_price;
      }
      
      return updated;
    });
  };

  // =====================================================
  //  CREATE OR UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // === VALIDACIÓN DE CAMPOS VACÍOS ===
    if (
      !formData.name.trim() ||
      !formData.unit_price ||
      !formData.um.trim() ||
      !formData.stock ||
      !formData.min_stock
    ) {
      setShowFormAlert(true);
      return;
    }

    const payload = {
      name: formData.name,
      unit_price: parseFloat(formData.unit_price),
      um: formData.um,
      stock: parseFloat(formData.stock),
      min_stock: parseFloat(formData.min_stock),
    };

    try {
      if (!editMode) {
        const res = await fetch(`https://server-eme-mar.onrender.com/insumos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const created = await res.json();
        setInsumos([...insumos, created]);
      } else {
        const res = await fetch(
          `https://server-eme-mar.onrender.com/insumos/${formData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const updated = await res.json();
        setInsumos(insumos.map((i) => (i.id === updated.id ? updated : i)));
      }

      closeModal();
    } catch (error) {
      console.error("Error al guardar insumo:", error);
    }
  };

  // =====================================================
  //  HANDLE SUPPLY
  // =====================================================
  const handleSupplySubmit = async (e) => {
    e.preventDefault();

    if (!supplyData.amount || parseFloat(supplyData.amount) <= 0) {
      setShowSupplyAlert(true);
      return;
    }

    try {
      const payload = {
        id_insumo: supplyData.id_insumo,
        amount: parseFloat(supplyData.amount),
        total_amount: supplyData.total_amount,
      };

      const res = await fetch("https://server-eme-mar.onrender.com/moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al surtir insumo");
      }

      // Recargar insumos para ver el stock actualizado
      await loadInsumos();
      closeSupplyModal();
      setShowSupplySuccessAlert(true);
    } catch (error) {
      console.error("Error al surtir insumo:", error);
      setShowSupplyErrorAlert(true);
    }
  };

  // =====================================================
  //  DELETE
  // =====================================================
  const confirmDeleteInsumo = (insumo) => {
    setInsumoToDelete(insumo);
    setShowDeleteAlert(true);
  };

  const deleteInsumo = async () => {
    if (!insumoToDelete) return;

    try {
      await fetch(`https://server-eme-mar.onrender.com/insumos/${insumoToDelete.id}`, {
        method: "DELETE",
      });

      setInsumos(insumos.filter((i) => i.id !== insumoToDelete.id));
      setShowDeleteAlert(false);
      setInsumoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar insumo:", error);
    }
  };

  // =====================================================
  //  RENDER
  // =====================================================
  return (
    <div className={styles.inventory}>
      {/* Header */}
      <div className={styles.inventoryHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.inventoryTitle}>Inventario de Insumos</h2>
          <p className={styles.inventorySubtitle}>
            Gestiona tus productos y stock
          </p>
        </div>

        <button className={styles.createButton} onClick={openCreateModal}>
          <span className={styles.createButtonIcon}>+</span>
          <span className={styles.createButtonText}>Nuevo Insumo</span>
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar insumo..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Lista */}
      {loading ? (
        <div className={styles.loading}>Cargando insumos...</div>
      ) : insumos.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay insumos registrados</p>
          <button className={styles.emptyButton} onClick={openCreateModal}>
            Crear primer insumo
          </button>
        </div>
      ) : (
        <div className={styles.inventoryContainer}>
          {filteredInsumos.map((insumo) => (
            <InsumoCard
              key={insumo.id}
              insumo={insumo}
              onEdit={() => openEditModal(insumo)}
              onDelete={() => confirmDeleteInsumo(insumo)}
              onSupply={() => openSupplyModal(insumo)}
            />
          ))}
        </div>
      )}

      {/* === MODAL CREAR / EDITAR === */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editMode ? " Editar Insumo" : "➕ Crear Nuevo Insumo"}
              </h3>

              <button className={styles.closeIcon} onClick={closeModal}>
                ×
              </button>
            </div>

            <div className={styles.modalForm}>
              {/* Nombre del Insumo */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Insumo *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej: Harina de Trigo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              {/* Precio y Unidad de Medida */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio Unitario *</label>
                  <input
                    name="unit_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unit_price}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Unidad de Medida *</label>
                  <input
                    name="um"
                    type="text"
                    placeholder="kg, lt, unid"
                    value={formData.um}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Stock Actual y Mínimo */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock Actual *</label>
                  <input
                    name="stock"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock Mínimo *</label>
                  <input
                    name="min_stock"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.min_stock}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  {editMode ? " Actualizar" : " Crear"}
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL SURTIR INSUMO === */}
      {showSupplyModal && insumoToSupply && (
        <div className={styles.modalOverlay} onClick={closeSupplyModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                🛒 Surtir Insumo: {insumoToSupply.name}
              </h3>
              <button className={styles.closeIcon} onClick={closeSupplyModal}>
                ×
              </button>
            </div>

            <div className={styles.modalForm}>
              {/* Información del insumo */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Información del Insumo</label>
                <div className={styles.infoBox}>
                  <p><strong>Stock actual:</strong> {insumoToSupply.stock} {insumoToSupply.um}</p>
                  <p><strong>Precio unitario:</strong> ${insumoToSupply.unit_price} / {insumoToSupply.um}</p>
                  <p><strong>Stock mínimo:</strong> {insumoToSupply.min_stock} {insumoToSupply.um}</p>
                </div>
              </div>

              {/* Cantidad a surtir */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cantidad a Surtir *</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ingresa la cantidad"
                  value={supplyData.amount}
                  onChange={handleSupplyChange}
                  required
                  className={styles.formInput}
                />
              </div>

              {/* Total calculado */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total a Pagar</label>
                <div className={styles.totalBox}>
                  <span className={styles.totalAmount}>
                    ${supplyData.total_amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2,})}
                  </span>
                  <small>
                    ({supplyData.amount || 0} {insumoToSupply.um} × ${insumoToSupply.unit_price})
                  </small>
                </div>
              </div>

              {/* Nuevo stock calculado */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nuevo Stock</label>
                <div className={styles.infoBox}>
                  <p>
                    <strong>Stock actual:</strong> {insumoToSupply.stock} {insumoToSupply.um}
                  </p>
                  <p>
                    <strong>+ Cantidad a surtir:</strong> {supplyData.amount || 0} {insumoToSupply.um}
                  </p>
                  <p>
                    <strong>= Nuevo stock:</strong>{" "}
                    {(insumoToSupply.stock + (parseFloat(supplyData.amount) || 0)).toFixed(2)} {insumoToSupply.um}
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSupplySubmit}
                  disabled={!supplyData.amount || parseFloat(supplyData.amount) <= 0}
                >
                  Confirmar Surtido
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeSupplyModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === ALERTA VALIDACIÓN SUPPLY === */}
      {showSupplyAlert && (
        <Alert
          type="warning"
          onClose={() => setShowSupplyAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>
              <h3 className={styles.alertTitle}>Cantidad inválida</h3>
              <p className={styles.alertText}>
                Por favor ingresa una cantidad válida para surtir.
              </p>
              <div className={styles.alertButtons}>
                <button
                  onClick={() => setShowSupplyAlert(false)}
                  className={styles.alertCancelButton}
                >
                  Entendido
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* === ALERTA SUPPLY EXITOSO === */}
      {showSupplySuccessAlert && (
        <Alert
          type="success"
          onClose={() => setShowSupplySuccessAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>✅</div>
              <h3 className={styles.alertTitle}>¡Surtido exitoso!</h3>
              <p className={styles.alertText}>
                El insumo ha sido surtido correctamente y el stock ha sido actualizado.
              </p>
              <div className={styles.alertButtons}>
                <button
                  onClick={() => setShowSupplySuccessAlert(false)}
                  className={styles.alertCancelButton}
                >
                  Aceptar
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* === ALERTA ERROR SUPPLY === */}
      {showSupplyErrorAlert && (
        <Alert
          type="error"
          onClose={() => setShowSupplyErrorAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>❌</div>
              <h3 className={styles.alertTitle}>Error al surtir</h3>
              <p className={styles.alertText}>
                Ha ocurrido un error al intentar surtir el insumo. Por favor intenta nuevamente.
              </p>
              <div className={styles.alertButtons}>
                <button
                  onClick={() => setShowSupplyErrorAlert(false)}
                  className={styles.alertCancelButton}
                >
                  Entendido
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* === ALERTA ELIMINAR === */}
      {showDeleteAlert && (
        <Alert
          type="warning"
          onClose={() => setShowDeleteAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>

              <h3 className={styles.alertTitle}>¿Eliminar Insumo?</h3>

              <p className={styles.alertText}>
                Estás a punto de eliminar{" "}
                <strong>{insumoToDelete?.name}</strong>. Esta acción no se puede
                deshacer.
              </p>

              <div className={styles.alertButtons}>
                <button
                  onClick={deleteInsumo}
                  className={styles.deleteConfirmButton}
                >
                  Sí, Eliminar
                </button>

                <button
                  onClick={() => setShowDeleteAlert(false)}
                  className={styles.alertCancelButton}
                >
                  Cancelar
                </button>
              </div>
            </div>
          }
        />
      )}
      
      {/* === ALERTA FORMULARIO VACÍO === */}
      {showFormAlert && (
        <Alert
          type="warning"
          onClose={() => setShowFormAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>

              <h3 className={styles.alertTitle}>Faltan campos obligatorios</h3>

              <p className={styles.alertText}>
                Debes completar <strong>todos los campos</strong> antes de
                continuar.
              </p>

              <div className={styles.alertButtons}>
                <button
                  onClick={() => setShowFormAlert(false)}
                  className={styles.alertCancelButton}
                >
                  Entendido
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}