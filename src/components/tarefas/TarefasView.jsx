import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, FolderKanban, CheckSquare, Calendar, User,
    ChevronRight, ChevronDown, Filter
} from 'lucide-react';
import tarefasService from '../../services/tarefasService';
import projetosService from '../../services/projetosService';
import TarefaDetailModal from './TarefaDetailModal';
import styles from './TarefasView.module.css';

const TarefasView = () => {
    const [tarefas, setTarefas] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('responsavel'); // 'responsavel' | 'projeto'
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedTarefa, setSelectedTarefa] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tarefasData, projetosData] = await Promise.all([
                tarefasService.getAll(),
                projetosService.getAll()
            ]);
            setTarefas(tarefasData || []);
            setProjetos(projetosData || []);

            // Expand first group by default
            if (tarefasData && tarefasData.length > 0) {
                const firstKey = viewMode === 'responsavel'
                    ? (tarefasData[0].responsavel || 'Sem Responsável')
                    : tarefasData[0].objetivo?.projeto_id;
                setExpandedGroups({ [firstKey]: true });
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group tarefas by responsavel or projeto
    const groupedTarefas = useMemo(() => {
        if (viewMode === 'responsavel') {
            // Group by responsavel, show projeto info
            const groups = {};
            tarefas.forEach(tarefa => {
                const key = tarefa.responsavel || 'Sem Responsável';
                if (!groups[key]) {
                    groups[key] = {
                        name: key,
                        tarefas: []
                    };
                }
                groups[key].tarefas.push(tarefa);
            });
            return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Group by projeto, show responsavel info
            const groups = {};
            tarefas.forEach(tarefa => {
                const projetoId = tarefa.objetivo?.projeto_id || 'sem-projeto';
                const projeto = projetos.find(p => p.id === tarefa.objetivo?.projeto_id);
                const key = projetoId;
                if (!groups[key]) {
                    groups[key] = {
                        id: projetoId,
                        name: projeto ? `${projeto.codigo} - ${projeto.descricao}` : 'Sem Projeto',
                        tarefas: []
                    };
                }
                groups[key].tarefas.push(tarefa);
            });
            return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [tarefas, projetos, viewMode]);

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const getStatusClass = (tarefa) => {
        if (tarefa.concluida) return styles.concluida;
        if (tarefa.data_expectativa) {
            const today = new Date();
            const expectativa = new Date(tarefa.data_expectativa);
            if (expectativa < today) return styles.atrasada;
        }
        return '';
    };

    const handleTarefaClick = (tarefa) => {
        setSelectedTarefa(tarefa);
    };

    const handleCloseModal = () => {
        setSelectedTarefa(null);
    };

    const handleTarefaUpdate = () => {
        loadData(); // Reload data when tarefa is updated
    };

    if (loading) {
        return (
            <div className="container">
                <div className={styles.loading}>Carregando tarefas...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Tarefas</h1>
            </div>

            {/* View Mode Toggle */}
            <div className={styles.viewToggle}>
                <span className={styles.viewLabel}>
                    <Filter size={16} /> Agrupar por:
                </span>
                <div className={styles.toggleButtons}>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'responsavel' ? styles.active : ''}`}
                        onClick={() => setViewMode('responsavel')}
                    >
                        <Users size={16} />
                        Responsável
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'projeto' ? styles.active : ''}`}
                        onClick={() => setViewMode('projeto')}
                    >
                        <FolderKanban size={16} />
                        Projeto
                    </button>
                </div>
            </div>

            {/* Grouped Tarefas */}
            {groupedTarefas.length === 0 ? (
                <div className={styles.emptyState}>
                    <CheckSquare size={48} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Nenhuma tarefa encontrada</h2>
                    <p className={styles.emptyDescription}>
                        As tarefas são criadas dentro dos objetivos no Fluxo Operacional.
                    </p>
                </div>
            ) : (
                <div className={styles.groupsContainer}>
                    {groupedTarefas.map(group => (
                        <div key={group.name || group.id} className={styles.groupCard}>
                            <div
                                className={styles.groupHeader}
                                onClick={() => toggleGroup(group.name || group.id)}
                            >
                                <div className={styles.groupInfo}>
                                    {viewMode === 'responsavel' ? (
                                        <User size={20} className={styles.groupIcon} />
                                    ) : (
                                        <FolderKanban size={20} className={styles.groupIcon} />
                                    )}
                                    <span className={styles.groupName}>{group.name}</span>
                                    <span className={styles.groupCount}>{group.tarefas.length} tarefa(s)</span>
                                </div>
                                <div className={styles.groupActions}>
                                    {expandedGroups[group.name || group.id] ? (
                                        <ChevronDown size={20} />
                                    ) : (
                                        <ChevronRight size={20} />
                                    )}
                                </div>
                            </div>

                            {expandedGroups[group.name || group.id] && (
                                <div className={styles.groupContent}>
                                    {group.tarefas.map(tarefa => (
                                        <div
                                            key={tarefa.id}
                                            className={`${styles.tarefaItem} ${getStatusClass(tarefa)}`}
                                            onClick={() => handleTarefaClick(tarefa)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={styles.tarefaContent}>
                                                <div className={styles.tarefaTop}>
                                                    <span className={styles.tarefaCodigo}>{tarefa.codigo}</span>
                                                    <span className={`${styles.tarefaDescricao} ${tarefa.concluida ? styles.textConcluida : ''}`}>
                                                        {tarefa.titulo || tarefa.descricao}
                                                    </span>
                                                </div>
                                                <div className={styles.tarefaMeta}>
                                                    {viewMode === 'responsavel' && tarefa.objetivo && (
                                                        <span className={styles.metaItem}>
                                                            <FolderKanban size={12} />
                                                            {tarefa.objetivo.codigo}
                                                        </span>
                                                    )}
                                                    {viewMode === 'projeto' && tarefa.responsavel && (
                                                        <span className={styles.metaItem}>
                                                            <User size={12} />
                                                            {tarefa.responsavel}
                                                        </span>
                                                    )}
                                                    {tarefa.data_expectativa && (
                                                        <span className={styles.metaItem}>
                                                            <Calendar size={12} />
                                                            {formatDate(tarefa.data_expectativa)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={styles.tarefaChevron} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Tarefa Detail Modal */}
            {selectedTarefa && (
                <TarefaDetailModal
                    tarefa={selectedTarefa}
                    onClose={handleCloseModal}
                    onUpdate={handleTarefaUpdate}
                />
            )}
        </div>
    );
};

export default TarefasView;

