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

function InicioView() {
  const [balance, setBalance] = useState({ balance: 0, amount_owed: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const accountRes = await fetch("https://server-eme-mar.onrender.com/moves/account");
      const accountData = await accountRes.json();
      setBalance({
        balance: accountData.balance || 0,
        amount_owed: accountData.amount_owed || 0
      });

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
    if (movement.descripcion?.includes("Abono a crédito")) {
      return (
        <div className={`${styles.iconCircle} ${styles.iconCredit}`}>
          <CreditCard size={20} />
        </div>
      );
    }

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
              {formatCurrency(balance.balance)}
            </span>
          </div>

          <div className={styles.balanceItem}>
            <span className={styles.balanceLabel}>Por Cobrar</span>
            <span className={`${styles.balanceAmount} ${styles.negative}`}>
              {formatCurrency(balance.amount_owed)}
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

                  {/* FECHA CORREGIDA */}
                  <div className={styles.movementDate}>
                    {formatDateMinus4(movement.date)}
                  </div>
                </div>

                <div className={`${styles.movementAmount} ${
                  movement.type === "ingreso" ? styles.amountPositive : styles.amountNegative
                }`}>
                  {movement.type === "ingreso" ? "+" : "-"}
                  {formatCurrency(movement.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Views
function InventarioView() { return <Inventory />; }
function ProductosView() { return <Products />; }
function MovimientosView() { return <Movements/>; }
function ClientesView() { return <Clients />; }

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("caja");

  const tabs = [
    { id: "inventario", label: "Inventario", icon: Package },
    { id: "productos", label: "Productos", icon: ShoppingBag },
    { id: "caja", label: "Inicio/Caja", icon: Home },
    { id: "movimientos", label: "Movimientos", icon: DollarSign },
    { id: "clientes", label: "Clientes", icon: User },
  ];

  const renderView = () => {
    switch (activeTab) {
      case "caja": return <InicioView />;
      case "inventario": return <InventarioView />;
      case "productos": return <ProductosView />;
      case "movimientos": return <MovimientosView />;
      case "clientes": return <ClientesView />;
      default: return <InicioView />;
    }
  };

  return (
    <div className={`${styles.container} safe-area`}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Eme Mar</h1>
      </header>

      <main className={styles.main}>{renderView()}</main>

      <nav className={styles.bottomNav}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""}`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? "#4a3b2e" : "#6b5a4b"}
              />
              <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
