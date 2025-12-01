import React, { useEffect } from 'react'
import styles from './Alert.module.css'

export default function Alert({ type = 'info', message, onClose }) {
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape' && onClose) onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const typeClass = styles[type] || styles.info

    return (
        <div className={styles.overlay} onClick={() => onClose && onClose()}>
            <div
                className={`${styles.modal} ${typeClass}`}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.close}
                    aria-label="Cerrar alerta"
                    onClick={() => onClose && onClose()}
                >
                    ×
                </button>

                <div className={styles.content}>
                    {typeof message === 'string' ? <p className={styles.message}>{message}</p> : message}
                </div>
            </div>
        </div>
    )
}