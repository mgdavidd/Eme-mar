import React from "react";
import styles from "./InsumosCard.module.css";

function InsumoCard({ insumo, onEdit, onDelete, onSupply }) {
  return (
    <div className={styles.card}>
      <div className={styles.right}>
        <div className={styles.info}>
          <h3 className={styles.title}>{insumo.name}</h3>

          <div className={styles.row}>
            <span className={styles.label}>Precio:</span>
            <span className={styles.value}>
              ${insumo.unit_price} / {insumo.um}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Stock:</span>
            <span
              className={`${styles.value} ${
                insumo.stock <= insumo.min_stock ? styles.low : ""
              }`}
            >
              {insumo.stock} {insumo.um}
            </span>
          </div>
          
          {/* Stock mínimo indicador */}
          <div className={styles.row}>
            <span className={styles.label}>Mínimo:</span>
            <span className={styles.value}>
              {insumo.min_stock} {insumo.um}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.supplyButton} 
            onClick={() => onSupply(insumo)}
            title="Surtir insumo"
          >
            surtir
          </button>
          <button className={styles.editButton} onClick={() => onEdit(insumo)}>
            editar
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(insumo)}
          >
            eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsumoCard;