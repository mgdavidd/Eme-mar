import React, { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard.jsx";
import Alert from "../../components/Alert";
import styles from "./Products.module.css";
import { Pencil, Plus, Settings, Trash2 } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [insumos, setInsumos] = useState([]); // Lista de insumos disponibles
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormAlert, setShowFormAlert] = useState(false);
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert ] = useState(false)

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    foto: null,
    insumos: [], // Array de { id_insumo, quantity }
  });

  const [insumoForm, setInsumoForm] = useState({
    id_insumo: "",
    quantity: "",
  });

  // Estado para editar cantidades sin actualizar automáticamente
  const [editingQuantities, setEditingQuantities] = useState({});

  // =====================================================
  //  LOAD DATA - Productos e Insumos
  // =====================================================
  useEffect(() => {
    loadProducts();
    loadInsumos();
  }, []);

  // FETCH 1: Obtener todos los productos
  // GET https://server-eme-mar.onrender.com/products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://server-eme-mar.onrender.com/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH 2: Obtener todos los insumos disponibles
  // GET https://server-eme-mar.onrender.com/insumos
  const loadInsumos = async () => {
    try {
      const res = await fetch("https://server-eme-mar.onrender.com/insumos");
      const data = await res.json();
      setInsumos(data);
    } catch (error) {
      console.error("Error al cargar insumos:", error);
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =====================================================
  //  OPEN MODAL (CREATE)
  // =====================================================
  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      id: null,
      name: "",
      price: "",
      foto: null,
      insumos: [],
    });
    setShowModal(true);
  };

  // =====================================================
  //  OPEN MODAL (EDIT)
  // =====================================================
  const openEditModal = (product) => {
    setEditMode(true);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      foto: product.foto,
      insumos: product.insumos || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      id: null,
      name: "",
      price: "",
      foto: null,
      insumos: [],
    });
  };

  // =====================================================
  //  HANDLE INPUTS
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejar la imagen/foto
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remover el prefijo "data:image/...;base64," para enviar solo el base64 puro
        const base64String = reader.result.split(',')[1];
        setFormData({
          ...formData,
          foto: base64String, // Solo base64 sin prefijo
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // =====================================================
  //  GESTIÓN DE INSUMOS DEL PRODUCTO
  // =====================================================
  
  // Agregar insumo al producto (en modo creación)
  const handleAddInsumo = () => {
    if (!insumoForm.id_insumo || !insumoForm.quantity) {
      alert("Selecciona un insumo y cantidad");
      return;
    }

    const newInsumo = {
      id_insumo: parseInt(insumoForm.id_insumo),
      quantity: parseFloat(insumoForm.quantity),
    };

    // Verificar que no esté duplicado
    const exists = formData.insumos.find(
      (i) => i.id_insumo === newInsumo.id_insumo
    );
    if (exists) {
      alert("Este insumo ya fue agregado");
      return;
    }

    setFormData({
      ...formData,
      insumos: [...formData.insumos, newInsumo],
    });

    setInsumoForm({ id_insumo: "", quantity: "" });
  };

  // Eliminar insumo del producto (en modo creación/edición)
  const handleRemoveInsumo = async (insumoId) => {
    if (editMode && currentProductId) {
      // FETCH 7: Eliminar insumo de un producto existente
      // DELETE https://server-eme-mar.onrender.com/products/{productId}/insumos/{insumoId}
      try {
        await fetch(
          `https://server-eme-mar.onrender.com/products/${currentProductId}/insumos/${insumoId}`,
          {
            method: "DELETE",
          }
        );
        
        setFormData({
          ...formData,
          insumos: formData.insumos.filter((i) => i.id_insumo !== insumoId),
        });
        
        // Recargar productos para actualizar costo_total
        loadProducts();
      } catch (error) {
        console.error("Error al eliminar insumo:", error);
      }
    } else {
      // Solo en creación, eliminar del estado local
      setFormData({
        ...formData,
        insumos: formData.insumos.filter((i) => i.id_insumo !== insumoId),
      });
    }
  };

  // Actualizar cantidad de un insumo existente en un producto
  const handleUpdateInsumoQuantity = async (insumoId, newQuantity) => {
    if (editMode && currentProductId) {
      // FETCH 8: Actualizar cantidad de insumo en producto
      // PUT https://server-eme-mar.onrender.com/products/{productId}/insumos/{insumoId}
      try {
        await fetch(
          `https://server-eme-mar.onrender.com/products/${currentProductId}/insumos/${insumoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: parseFloat(newQuantity) }),
          }
        );
        
        setFormData({
          ...formData,
          insumos: formData.insumos.map((i) =>
            i.id_insumo === insumoId
              ? { ...i, quantity: parseFloat(newQuantity) }
              : i
          ),
        });
        
        // Limpiar el estado de edición
        const newEditingQuantities = { ...editingQuantities };
        delete newEditingQuantities[insumoId];
        setEditingQuantities(newEditingQuantities);
        
        // Recargar productos para actualizar costo_total
        loadProducts();
      } catch (error) {
        console.error("Error al actualizar cantidad:", error);
      }
    } else {
      // Solo actualizar estado local en modo creación
      setFormData({
        ...formData,
        insumos: formData.insumos.map((i) =>
          i.id_insumo === insumoId
            ? { ...i, quantity: parseFloat(newQuantity) }
            : i
        ),
      });
    }
  };

  // Manejar cambio temporal de cantidad (sin guardar aún)
  const handleQuantityChange = (insumoId, value) => {
    setEditingQuantities({
      ...editingQuantities,
      [insumoId]: value,
    });
  };

  // Obtener la cantidad actual (editada o original)
  const getCurrentQuantity = (insumo) => {
    if (editingQuantities[insumo.id_insumo] !== undefined) {
      return editingQuantities[insumo.id_insumo];
    }
    return insumo.quantity;
  };

  // Verificar si hay cambios pendientes
  const hasChanges = (insumoId) => {
    return editingQuantities[insumoId] !== undefined;
  };

  // Cancelar edición de cantidad
  const cancelQuantityEdit = (insumoId) => {
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[insumoId];
    setEditingQuantities(newEditingQuantities);
  };

  // =====================================================
  //  CREATE OR UPDATE PRODUCT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.name.trim() || !formData.price) {
      setShowFormAlert(true);
      return;
    }

    try {
      if (!editMode) {
        // FETCH 3: Crear nuevo producto
        // POST https://server-eme-mar.onrender.com/products
        // Body: { name, price, foto (opcional base64), insumos: [{id_insumo, quantity}] }
        const payload = {
          name: formData.name,
          price: parseFloat(formData.price),
          foto: formData.foto || null,
          insumos: formData.insumos,
        };

        const res = await fetch(`https://server-eme-mar.onrender.com/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          setProducts([...products, created]);
          closeModal();
          loadProducts(); // Recargar para obtener costo_total calculado
        } else {
          const errorData = await res.json();
          console.error("Error del servidor:", errorData);
          alert(`Error al crear producto: ${errorData.error || 'Error desconocido'}`);
        }
      } else {
        // FETCH 4: Actualizar producto (solo name, price, foto)
        // PUT https://server-eme-mar.onrender.com/products/{id}
        // Body: { name, price, foto }
        const payload = {
          name: formData.name,
          price: parseFloat(formData.price),
          foto: formData.foto || null,
        };

        const res = await fetch(
          `https://server-eme-mar.onrender.com/products/${formData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const updated = await res.json();
          setProducts(
            products.map((p) => (p.id === updated.id ? updated : p))
          );
          closeModal();
          loadProducts(); // Recargar
        } else {
          const errorData = await res.json();
          console.error("Error del servidor:", errorData);
          alert(`Error al actualizar producto: ${errorData.error || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  // =====================================================
  //  DELETE PRODUCT
  // =====================================================
  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteAlert(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await fetch(`https://server-eme-mar.onrender.com/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteAlert(false);
      setProductToDelete(null);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // =====================================================
  //  MODAL PARA GESTIONAR INSUMOS DE UN PRODUCTO
  // =====================================================
  const openInsumoModal = (product) => {
    setCurrentProductId(product.id);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      foto: product.foto,
      insumos: product.insumos || [],
    });
    setEditMode(true);
    setShowInsumoModal(true);
  };

  const closeInsumoModal = () => {
    setShowInsumoModal(false);
    setCurrentProductId(null);
    setInsumoForm({ id_insumo: "", quantity: "" });
    setEditingQuantities({}); // Limpiar ediciones pendientes
  };

  // Agregar insumo a producto existente
  const handleAddInsumoToExistingProduct = async () => {
    if (!insumoForm.id_insumo || !insumoForm.quantity) {
      alert("Selecciona un insumo y cantidad");
      return;
    }

    // FETCH 6: Agregar/Actualizar insumo a producto existente
    // POST https://server-eme-mar.onrender.com/products/{productId}/insumos/{insumoId}
    // Body: { quantity }
    try {
      await fetch(
        `https://server-eme-mar.onrender.com/products/${currentProductId}/insumos/${insumoForm.id_insumo}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: parseFloat(insumoForm.quantity) }),
        }
      );

      setInsumoForm({ id_insumo: "", quantity: "" });
      loadProducts(); // Recargar para ver cambios
      
      // Actualizar el formData local
      const updatedProduct = products.find(p => p.id === currentProductId);
      if (updatedProduct) {
        setFormData({
          ...formData,
          insumos: updatedProduct.insumos
        });
      }
    } catch (error) {
      console.error("Error al agregar insumo:", error);
    }
  };

  // Obtener nombre del insumo por ID
  const getInsumoName = (id) => {
    const insumo = insumos.find((i) => i.id === id);
    return insumo ? `${insumo.name} (${insumo.um})` : "Desconocido";
  };

  // =====================================================
  //  RENDER
  // =====================================================
  return (
    <div className={styles.products}>
      {/* Header */}
      <div className={styles.productsHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.productsTitle}>Catálogo de Productos</h2>
          <p className={styles.productsSubtitle}>
            Gestiona tus productos y sus insumos
          </p>
        </div>

        <button className={styles.createButton} onClick={openCreateModal}>
          <span className={styles.createButtonIcon}>+</span>
          <span className={styles.createButtonText}>Nuevo Producto</span>
        </button>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar producto..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Lista de Productos */}
      {loading ? (
        <div className={styles.loading}>Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay productos registrados</p>
          <button className={styles.emptyButton} onClick={openCreateModal}>
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className={styles.productsContainer}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => openEditModal(product)}
              onDelete={() => confirmDeleteProduct(product)}
              onManageInsumos={() => openInsumoModal(product)}
              getInsumoName={getInsumoName}
            />
          ))}
        </div>
      )}

      {/* === MODAL CREAR / EDITAR PRODUCTO === */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editMode ? <Pencil /> : <Plus />} {editMode ? "Editar Producto" : "Crear Nuevo Producto"}
              </h3>
              <button className={styles.closeIcon} onClick={closeModal}>
                ×
              </button>
            </div>

            <div className={styles.modalForm}>
              {/* Nombre del Producto */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Producto *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej: Pizza Margarita"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              {/* Precio */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Precio de Venta *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              {/* Foto */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Foto del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.formInput}
                />
              </div>

              {/* Sección de Insumos (solo en creación) */}
              {!editMode && (
                <div className={styles.insumosSection}>
                  <h4 className={styles.sectionTitle}>Insumos del Producto</h4>
                  
                  <div className={styles.insumoInputs}>
                    <select
                      value={insumoForm.id_insumo}
                      onChange={(e) =>
                        setInsumoForm({ ...insumoForm, id_insumo: e.target.value })
                      }
                      className={styles.formInput}
                    >
                      <option value="">Seleccionar insumo...</option>
                      {insumos.map((insumo) => (
                        <option key={insumo.id} value={insumo.id}>
                          {insumo.name} ({insumo.um})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Cantidad"
                      value={insumoForm.quantity}
                      onChange={(e) =>
                        setInsumoForm({ ...insumoForm, quantity: e.target.value })
                      }
                      className={styles.formInput}
                    />

                    <button
                      type="button"
                      onClick={handleAddInsumo}
                      className={styles.addInsumoButton}
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Lista de insumos agregados */}
                  {formData.insumos.length > 0 && (
                    <div className={styles.insumosList}>
                      {formData.insumos.map((insumo) => (
                        <div key={insumo.id_insumo} className={styles.insumoItem}>
                          <span>{getInsumoName(insumo.id_insumo)}</span>
                          <span className={styles.insumoQuantity}>
                            {insumo.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInsumo(insumo.id_insumo)}
                            className={styles.removeInsumoButton}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Nota para modo edición */}
              {editMode && (
                <div className={styles.editNote}>
                  <p>
                    💡 Para gestionar los insumos de este producto, usa el botón
                    "Gestionar Insumos" en la tarjeta del producto.
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  {editMode ? "💾 Actualizar" : "✓ Crear"}
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

      {/* === MODAL GESTIONAR INSUMOS === */}
      {showInsumoModal && (
        <div className={styles.modalOverlay} onClick={closeInsumoModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Settings size={20} /> Gestionar Insumos - {formData.name}
              </h3>
              <button className={styles.closeIcon} onClick={closeInsumoModal}>
                ×
              </button>
            </div>

            <div className={styles.modalForm}>
              {/* Agregar nuevo insumo */}
              <div className={styles.insumosSection}>
                <h4 className={styles.sectionTitle}>Agregar Insumo</h4>
                
                <div className={styles.insumoInputs}>
                  <select
                    value={insumoForm.id_insumo}
                    onChange={(e) =>
                      setInsumoForm({ ...insumoForm, id_insumo: e.target.value })
                    }
                    className={styles.formInput}
                  >
                    <option value="">Seleccionar insumo...</option>
                    {insumos.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.name} ({insumo.um})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cantidad"
                    value={insumoForm.quantity}
                    onChange={(e) =>
                      setInsumoForm({ ...insumoForm, quantity: e.target.value })
                    }
                    className={styles.formInput}
                  />

                  <button
                    type="button"
                    onClick={handleAddInsumoToExistingProduct}
                    className={styles.addInsumoButton}
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Lista de insumos actuales */}
              <div className={styles.insumosSection}>
                <h4 className={styles.sectionTitle}>Insumos Actuales</h4>
                
                {formData.insumos.length === 0 ? (
                  <p className={styles.emptyInsumos}>
                    No hay insumos asignados a este producto
                  </p>
                ) : (
                  <div className={styles.insumosList}>
                    {formData.insumos.map((insumo) => (
                      <div key={insumo.id_insumo} className={styles.insumoItemEditable}>
                        <span className={styles.insumoName}>
                          {getInsumoName(insumo.id_insumo)}
                        </span>
                        
                        <div className={styles.quantityEditGroup}>
                          <input
                            type="number"
                            step="0.01"
                            value={getCurrentQuantity(insumo)}
                            onChange={(e) =>
                              handleQuantityChange(insumo.id_insumo, e.target.value)
                            }
                            className={styles.quantityInput}
                          />
                          
                          {hasChanges(insumo.id_insumo) && (
                            <div className={styles.quantityActions}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateInsumoQuantity(
                                    insumo.id_insumo,
                                    editingQuantities[insumo.id_insumo]
                                  )
                                }
                                className={styles.saveQuantityButton}
                                title="Guardar cambios"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelQuantityEdit(insumo.id_insumo)}
                                className={styles.cancelQuantityButton}
                                title="Cancelar"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveInsumo(insumo.id_insumo)}
                          className={styles.removeInsumoButton}
                          title="Eliminar insumo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeInsumoModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessAlert && (
        <Alert
          type="success"
          onClose={() => setShowSuccessAlert(false)}
          message="Producto eliminado exitosamente."
        />
      )}
      

      {showDeleteAlert && (
        <Alert
          type="warning"
          onClose={() => setShowDeleteAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>
              <h3 className={styles.alertTitle}>¿Eliminar Producto?</h3>
              <p className={styles.alertText}>
                Estás a punto de eliminar{" "}
                <strong>{productToDelete?.name}</strong>. Esta acción no se
                puede deshacer.
              </p>
              <div className={styles.alertButtons}>
                <button
                  onClick={deleteProduct}
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

      {/* === ALERTA CAMPOS VACÍOS === */}
      {showFormAlert && (
        <Alert
          type="warning"
          onClose={() => setShowFormAlert(false)}
          message={
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>
              <h3 className={styles.alertTitle}>Faltan campos obligatorios</h3>
              <p className={styles.alertText}>
                Debes completar <strong>todos los campos obligatorios</strong>{" "}
                antes de continuar.
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