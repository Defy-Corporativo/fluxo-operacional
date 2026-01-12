import React from 'react';
import styles from './Settings.module.css';

const Settings = () => {
    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Configurações</h1>
            </div>

            <div className={styles.settingsContent}>
                <div className={styles.settingsCard}>
                    <h2 className={styles.settingsTitle}>Configurações do Sistema</h2>
                    <p className={styles.settingsDescription}>
                        Esta é a página de configurações do sistema. Adicione seus módulos de configuração aqui.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
