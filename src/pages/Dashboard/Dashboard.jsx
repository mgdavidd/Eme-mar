// Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  Home,
  DollarSign,
  User,
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import Clients from "../Clients/Clients";
import Inventory from "../Inventory/Inventory";
import Products from "../Products/Products";
import Movements from "../Movements/Movements";

function InicioView() {
  const [balance, setBalance] = useState({ balance: 0, amount_owed: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar información de cuenta
      const accountRes = await fetch("https://server-eme-mar.onrender.com/moves/account");
      const accountData = await accountRes.json();
      setBalance({
        balance: accountData.balance || 0,
        amount_owed: accountData.amount_owed || 0
      });

      // Cargar movimientos recientes
      const movesRes = await fetch("https://server-eme-mar.onrender.com/moves/recent");
      const movesData = await movesRes.json();
      setRecentMovements(movesData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (movement) => {
    // Detectar si es abono a crédito
    if (movement.descripcion?.includes("Abono a crédito")) {
      return (
        <div className={`${styles.iconCircle} ${styles.iconCredit}`}>
          <CreditCard size={20} />
        </div>
      );
    }
    
    // Movimiento normal según tipo
    if (movement.type === "ingreso") {
      return (
        <div className={`${styles.iconCircle} ${styles.iconIn}`}>
          <TrendingUp size={20} />
        </div>
      );
    }
    
    return (
      <div className={`${styles.iconCircle} ${styles.iconOut}`}>
        <TrendingDown size={20} />
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString("es-CO", { style: "currency", currency: "COP" }) || "0.00"}`;
  };

  return (
    <>
      <div className={styles.balanceCard}>
        <h2 className={styles.balanceTitle}>Caja</h2>

        <div className={styles.balanceGrid}>
          <div className={styles.balanceItem}>
            <span className={styles.balanceLabel}>Saldo</span>
            <span className={`${styles.balanceAmount} ${styles.positive}`}>
              {formatCurrency(balance.balance.toLocaleString("es-CO", { style: "currency", currency: "COP" }))}
            </span>
          </div>

          <div className={styles.balanceItem}>
            <span className={styles.balanceLabel}>Por Cobrar</span>
            <span className={`${styles.balanceAmount} ${styles.negative}`}>
              {formatCurrency(balance.amount_owed.toLocaleString("es-CO", { style: "currency", currency: "COP" }))}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className={styles.movementsCard}>
        <h3 className={styles.movementsTitle}>Últimos Movimientos</h3>
        
        {loading ? (
          <p className={styles.noMovements}>Cargando...</p>
        ) : recentMovements.length === 0 ? (
          <p className={styles.noMovements}>No hay movimientos recientes.</p>
        ) : (
          <div className={styles.movementsList}>
            {recentMovements.map((movement) => (
              <div key={movement.id} className={styles.movementItem}>
                <div className={styles.movementIcon}>
                  {getMovementIcon(movement)}
                </div>

                <div className={styles.movementDetails}>
                  <div className={styles.movementDescription}>
                    {movement.descripcion}
                  </div>
                  <div className={styles.movementDate}>
                    {movement.date}
                  </div>
                </div>

                <div className={`${styles.movementAmount} ${
                  movement.type === "ingreso" ? styles.amountPositive : styles.amountNegative
                }`}>
                  {movement.type === "ingreso" ? "+" : "-"}
                  {formatCurrency(movement.amount.toLocaleString("es-CO", { style: "currency", currency: "COP" }))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


// Componente para la vista de Inventario
function InventarioView() {
  return (
    <Inventory />
  );
}

// Componente para la vista de Productos
function ProductosView() {
  return <Products />;
}

// Componente para la vista de Movimientos
function MovimientosView() {
  return <Movements/>
}

// Componente para la vista de Clientes
function ClientesView() {
  return <Clients />
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("caja");

  const tabs = [
    { id: "inventario", label: "Inventario", icon: Package },
    { id: "productos", label: "Productos", icon: ShoppingBag },
    { id: "caja", label: "Inicio/Caja", icon: Home },
    { id: "movimientos", label: "Movimientos", icon: DollarSign },
    { id: "clientes", label: "Clientes", icon: User },
  ];

  // Función para renderizar la vista actual
  const renderView = () => {
    switch (activeTab) {
      case "caja":
        return <InicioView />;
      case "inventario":
        return <InventarioView />;
      case "productos":
        return <ProductosView />;
      case "movimientos":
        return <MovimientosView />;
      case "clientes":
        return <ClientesView />;
      default:
        return <InicioView />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Eme Mar</h1>
      </header>

      {/* Main Content - Renderiza la vista completa según el tab activo */}
      <main className={styles.main}>{renderView()}</main>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.navButton} ${
                isActive ? styles.navButtonActive : ""
              }`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? "#4a3b2e" : "#6b5a4b"}
              />
              <span
                className={`${styles.navLabel} ${
                  isActive ? styles.navLabelActive : ""
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
