import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Menu, ChevronLeft, ClipboardList, Target, CheckSquare, TrendingUp } from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {!isCollapsed && <div className={styles.sidebarOverlay} onClick={onToggle} />}
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    {isCollapsed ? (
                        <button
                            className={styles.toggleBtn}
                            onClick={onToggle}
                            title="Abrir menu"
                        >
                            <Menu size={20} />
                        </button>
                    ) : (
                        <>
                            <div className={styles.appBrand}>
                                <div className={styles.appIcon}>
                                    <ClipboardList size={22} />
                                </div>
                                <div className={styles.appBrandText}>
                                    <span className={styles.appName}>Fluxo</span>
                                    <span className={styles.appTagline}>Operacional</span>
                                </div>
                            </div>
                            <button
                                className={styles.toggleBtnLight}
                                onClick={onToggle}
                                title="Recolher menu"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    )}
                </div>
                <nav className={styles.nav}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Fluxo Operacional"
                        onClick={() => {
                            window.innerWidth < 768 && onToggle();
                        }}
                    >
                        <Target size={20} />
                        {!isCollapsed && <span>Fluxo Operacional</span>}
                    </NavLink>
                    <NavLink
                        to="/tarefas"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Tarefas"
                        onClick={() => {
                            window.innerWidth < 768 && onToggle();
                        }}
                    >
                        <CheckSquare size={20} />
                        {!isCollapsed && <span>Tarefas</span>}
                    </NavLink>
                    <NavLink
                        to="/acompanhamento"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Acompanhamento"
                        onClick={() => {
                            window.innerWidth < 768 && onToggle();
                        }}
                    >
                        <TrendingUp size={20} />
                        {!isCollapsed && <span>Acompanhamento</span>}
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Configurações"
                        onClick={() => {
                            window.innerWidth < 768 && onToggle();
                        }}
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span>Configurações</span>}
                    </NavLink>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

