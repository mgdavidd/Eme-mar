import React from "react";
import styles from "./ProductCard.module.css";
import { AlertCircle, Check, Pencil, Settings, Trash2 } from "lucide-react";
import Alert from "./Alert";

function ProductCard({
  product,
  onEdit,
  onDelete,
  onManageInsumos,
  getInsumoName,
}) {
  // Determinar si el producto tiene ganancia o pérdida
  const profit = product.price - product.costo_total;
  const isProfitable = profit > 0;

  return (
    <div className={styles.card}>
      {/* Imagen del producto */}
      <div className={styles.imageWrapper}>
        {product.foto ? (
          <img
            src={`data:image/jpeg;base64,${product.foto}`}
            alt={product.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>📦</span>
          </div>
        )}
      </div>

      {/* Contenido derecho */}
      <div className={styles.right}>
        <div className={styles.info}>
          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.row}>
            <span className={styles.label}>Precio de Venta:</span>
            <span className={styles.value}>
              $
              {product.price.toLocaleString("es-CO", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Costo Total:</span>
            <span className={styles.value}>
              ${product.costo_total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Ganancia:</span>
            <span
              className={`${styles.value} ${
                isProfitable ? styles.profit : styles.loss
              }`}
            >
              ${profit.toLocaleString("es-CO", { minimumFractionDigits: 2 })+ "  "}
              {isProfitable ? <Check size={15}/>: <AlertCircle size={15} />}
            </span>
          </div>

          {/* Insumos */}
          {product.insumos && product.insumos.length > 0 && (
            <div className={styles.insumosInfo}>
              <span className={styles.label}>Insumos:</span>
              <div className={styles.insumosList}>
                {product.insumos.slice(0, 3).map((insumo) => (
                  <span key={insumo.id_insumo} className={styles.insumoTag}>
                    {getInsumoName(insumo.id_insumo)}: {insumo.quantity}
                  </span>
                ))}
                {product.insumos.length > 3 && (
                  <span className={styles.insumoTag}>
                    +{product.insumos.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            className={styles.manageButton}
            onClick={() => onManageInsumos(product)}
            title="Gestionar insumos"
          >
            <Settings size={20} />
          </button>

          <button
            className={styles.editButton}
            onClick={() => onEdit(product)}
            title="Editar producto"
          >
            <Pencil size={16} />
          </button>

          <button
            className={styles.deleteButton}
            onClick={() => onDelete(product)}
            title="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
