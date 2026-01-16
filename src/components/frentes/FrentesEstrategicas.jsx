import React, { useState, useEffect } from 'react';
import {
    Plus, ChevronRight, ChevronLeft, ChevronDown, Pencil, Trash2, X, Save, Search,
    Target, FolderKanban, Flag, CheckSquare,
    Calendar, User, MessageSquare, StickyNote
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import frentesService from '../../services/frentesService';
import projetosService from '../../services/projetosService';
import objetivosService from '../../services/objetivosService';
import tarefasService from '../../services/tarefasService';
import notasService from '../../services/notasService';
import responsaveisService from '../../services/responsaveisService';
import TarefaDetailModal from '../tarefas/TarefaDetailModal';
import styles from './FrentesEstrategicas.module.css';

const FrentesEstrategicas = () => {
    const { user } = useAuth();
    const [frentes, setFrentes] = useState([]);
    const [responsaveis, setResponsaveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFrentes, setExpandedFrentes] = useState({});
    const [expandedProjetos, setExpandedProjetos] = useState({});
    const [expandedObjetivos, setExpandedObjetivos] = useState({});
    const [objetivosTree, setObjetivosTree] = useState({});
    const [tarefasMap, setTarefasMap] = useState({});

    // Selected Frente for internal navigation
    const [selectedFrente, setSelectedFrente] = useState(null);

    // Search in frente view
    const [frenteSearchTerm, setFrenteSearchTerm] = useState('');

    // Filters in frente view
    const [filterPendingOnly, setFilterPendingOnly] = useState(false);
    const [filterDate, setFilterDate] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalData, setModalData] = useState({});
    const [saving, setSaving] = useState(false);

    // Notas panel
    const [showNotasFor, setShowNotasFor] = useState(null);
    const [notas, setNotas] = useState([]);
    const [newNota, setNewNota] = useState('');

    // Objetivo detail modal
    const [selectedObjetivo, setSelectedObjetivo] = useState(null);
    const [selectedProjetoId, setSelectedProjetoId] = useState(null);

    // Tarefa detail modal (usando TarefaDetailModal padronizado)
    const [showTarefaModal, setShowTarefaModal] = useState(false);
    const [selectedTarefa, setSelectedTarefa] = useState(null);
    const [savingTarefa, setSavingTarefa] = useState(false);

    // Nova tarefa inline
    const [showNewTarefaForm, setShowNewTarefaForm] = useState(false);
    const [newTarefaData, setNewTarefaData] = useState({ titulo: '', descricao: '', responsavel: '', data_expectativa: '' });

    // Edição inline de objetivo
    const [editingObjetivo, setEditingObjetivo] = useState(false);
    const [objetivoEditData, setObjetivoEditData] = useState({});
    const [savingObjetivo, setSavingObjetivo] = useState(false);

    // Load data
    useEffect(() => {
        loadFrentes();
        loadResponsaveis();
    }, []);

    const loadFrentes = async () => {
        try {
            setLoading(true);
            const data = await frentesService.getAll();
            setFrentes(data || []);
            // Update selectedFrente with refreshed data
            if (selectedFrente) {
                const updatedFrente = (data || []).find(f => f.id === selectedFrente.id);
                if (updatedFrente) {
                    setSelectedFrente(updatedFrente);
                } else {
                    // Frente was deleted
                    setSelectedFrente(null);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar frentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadResponsaveis = async () => {
        try {
            const data = await responsaveisService.getAll();
            setResponsaveis(data || []);
        } catch (error) {
            console.error('Erro ao carregar responsáveis:', error);
        }
    };

    const loadObjetivos = async (projetoId) => {
        try {
            const tree = await objetivosService.getTree(projetoId);
            setObjetivosTree(prev => ({ ...prev, [projetoId]: tree }));
        } catch (error) {
            console.error('Erro ao carregar objetivos:', error);
        }
    };

    const loadTarefas = async (objetivoId) => {
        try {
            const tarefas = await tarefasService.getByObjetivo(objetivoId);
            setTarefasMap(prev => ({ ...prev, [objetivoId]: tarefas }));
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    };

    const loadNotas = async (tarefaId) => {
        try {
            const data = await notasService.getByTarefa(tarefaId);
            setNotas(data || []);
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
        }
    };

    // Toggle expansions
    const toggleFrente = (frenteId) => {
        setExpandedFrentes(prev => ({ ...prev, [frenteId]: !prev[frenteId] }));
    };

    const toggleProjeto = async (projetoId) => {
        const newExpanded = !expandedProjetos[projetoId];
        setExpandedProjetos(prev => ({ ...prev, [projetoId]: newExpanded }));
        if (newExpanded && !objetivosTree[projetoId]) {
            await loadObjetivos(projetoId);
        }
    };

    const toggleObjetivo = async (objetivoId) => {
        const newExpanded = !expandedObjetivos[objetivoId];
        setExpandedObjetivos(prev => ({ ...prev, [objetivoId]: newExpanded }));
        if (newExpanded && !tarefasMap[objetivoId]) {
            await loadTarefas(objetivoId);
        }
    };

    // Modal handlers
    const openModal = (type, data = {}) => {
        setModalType(type);
        setModalData(data);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setModalData({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            switch (modalType) {
                case 'frente':
                    if (modalData.id) {
                        await frentesService.update(modalData.id, modalData.descricao);
                    } else {
                        await frentesService.create(modalData.descricao);
                    }
                    await loadFrentes();
                    break;

                case 'projeto':
                    if (modalData.id) {
                        await projetosService.update(modalData.id, { descricao: modalData.descricao });
                    } else {
                        await projetosService.create({
                            descricao: modalData.descricao,
                            frente_id: modalData.frente_id
                        });
                    }
                    await loadFrentes();
                    break;

                case 'objetivo':
                    if (modalData.id) {
                        await objetivosService.update(modalData.id, {
                            titulo: modalData.titulo,
                            descricao: modalData.descricao,
                            responsavel: modalData.responsavel,
                            data_expectativa: modalData.data_expectativa || null
                        });
                    } else {
                        await objetivosService.create({
                            titulo: modalData.titulo,
                            descricao: modalData.descricao,
                            responsavel: modalData.responsavel,
                            data_expectativa: modalData.data_expectativa || null,
                            projeto_id: modalData.projeto_id,
                            parent_id: modalData.parent_id || null
                        });
                    }
                    await loadObjetivos(modalData.projeto_id);
                    break;

                case 'tarefa':
                    if (modalData.id) {
                        await tarefasService.update(modalData.id, {
                            titulo: modalData.titulo,
                            descricao: modalData.descricao,
                            responsavel: modalData.responsavel,
                            data_expectativa: modalData.data_expectativa || null
                        });
                    } else {
                        await tarefasService.create({
                            titulo: modalData.titulo,
                            descricao: modalData.descricao,
                            responsavel: modalData.responsavel,
                            data_expectativa: modalData.data_expectativa || null,
                            objetivo_id: modalData.objetivo_id
                        });
                    }
                    await loadTarefas(modalData.objetivo_id);
                    break;
            }
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            const errorMessage = error?.message || error?.error_description || 'Erro desconhecido';
            alert(`Erro ao salvar: ${errorMessage}\n\nVerifique os dados e tente novamente.`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Deseja realmente excluir? Esta ação não pode ser desfeita.')) return;

        try {
            switch (modalType) {
                case 'frente':
                    await frentesService.remove(modalData.id);
                    await loadFrentes();
                    break;
                case 'projeto':
                    await projetosService.remove(modalData.id);
                    await loadFrentes();
                    break;
                case 'objetivo':
                    await objetivosService.remove(modalData.id);
                    await loadObjetivos(modalData.projeto_id);
                    break;
                case 'tarefa':
                    await tarefasService.remove(modalData.id);
                    await loadTarefas(modalData.objetivo_id);
                    break;
            }
            closeModal();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir.');
        }
    };

    // Toggle tarefa completion
    const toggleTarefa = async (tarefa, objetivoId) => {
        try {
            await tarefasService.toggleConcluida(tarefa.id);
            await loadTarefas(objetivoId);
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    };

    // Notas handlers
    const openNotas = async (tarefaId) => {
        setShowNotasFor(tarefaId);
        await loadNotas(tarefaId);
    };

    const closeNotas = () => {
        setShowNotasFor(null);
        setNotas([]);
        setNewNota('');
    };

    const addNota = async () => {
        if (!newNota.trim()) return;

        try {
            const userName = user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.email?.split('@')[0] ||
                'Usuário';

            await notasService.create({
                tarefa_id: showNotasFor,
                texto: newNota.trim(),
                usuario: userName
            });
            setNewNota('');
            await loadNotas(showNotasFor);
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('pt-BR');
    };

    // ==================== FUNÇÕES DE TAREFA ====================
    const handleSelectTarefa = (tarefa) => {
        setSelectedTarefa(tarefa);
        setShowTarefaModal(true);
    };

    const handleCloseTarefaModal = () => {
        setShowTarefaModal(false);
        setSelectedTarefa(null);
    };

    const handleTarefaUpdate = async () => {
        // Recarregar tarefas do objetivo após atualização
        if (selectedObjetivo) {
            await loadTarefas(selectedObjetivo.id);
        }
    };

    const handleShowNewTarefaForm = () => {
        setShowNewTarefaForm(true);
        setNewTarefaData({ titulo: '', descricao: '', responsavel: '', data_expectativa: '' });
    };

    const handleCancelNewTarefa = () => {
        setShowNewTarefaForm(false);
        setNewTarefaData({ titulo: '', descricao: '', responsavel: '', data_expectativa: '' });
    };

    const handleCreateTarefaInline = async () => {
        if (!newTarefaData.titulo?.trim()) return;
        try {
            setSavingTarefa(true);
            await tarefasService.create({
                ...newTarefaData,
                objetivo_id: selectedObjetivo.id
            });
            setShowNewTarefaForm(false);
            setNewTarefaData({ titulo: '', descricao: '', responsavel: '', data_expectativa: '' });
            await loadTarefas(selectedObjetivo.id);
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            alert('Erro ao criar tarefa');
        } finally {
            setSavingTarefa(false);
        }
    };

    // Handlers para edição inline de objetivo
    const handleEditObjetivo = () => {
        setEditingObjetivo(true);
        setObjetivoEditData({
            titulo: selectedObjetivo.titulo || '',
            descricao: selectedObjetivo.descricao || '',
            responsavel: selectedObjetivo.responsavel || '',
            data_expectativa: selectedObjetivo.data_expectativa || ''
        });
    };

    const handleCancelEditObjetivo = () => {
        setEditingObjetivo(false);
        setObjetivoEditData({});
    };

    const handleSaveObjetivoEdit = async () => {
        if (!objetivoEditData.titulo?.trim() || savingObjetivo) return;
        try {
            setSavingObjetivo(true);
            await objetivosService.update(selectedObjetivo.id, objetivoEditData);
            // Atualizar objetivo local
            setSelectedObjetivo({ ...selectedObjetivo, ...objetivoEditData });
            setEditingObjetivo(false);
            // Recarregar objetivos do projeto
            if (selectedObjetivo.projeto_id) {
                await loadObjetivos(selectedObjetivo.projeto_id);
            }
        } catch (error) {
            console.error('Erro ao atualizar objetivo:', error);
            const errorMessage = error?.message || 'Erro desconhecido';
            alert(`Erro ao atualizar objetivo: ${errorMessage}`);
        } finally {
            setSavingObjetivo(false);
        }
    };

    const handleAddNotaTarefa = async () => {
        if (!newNota.trim() || !selectedTarefa) return;
        try {
            const userName = user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.email?.split('@')[0] ||
                'Usuário';

            await notasService.create({
                tarefa_id: selectedTarefa.id,
                texto: newNota.trim(),
                usuario: userName
            });
            setNewNota('');
            await loadNotas(selectedTarefa.id);
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
        }
    };

    // Render objetivo recursively
    const renderObjetivo = (objetivo, projetoId, level = 0) => {
        const hasChildren = objetivo.children && objetivo.children.length > 0;
        const isExpanded = expandedObjetivos[objetivo.id];
        const tarefas = tarefasMap[objetivo.id] || [];

        const handleObjetivoClick = () => {
            setSelectedObjetivo(objetivo);
            setSelectedProjetoId(projetoId);
            // Load tarefas if not loaded
            if (!tarefasMap[objetivo.id]) {
                loadTarefas(objetivo.id);
            }
        };

        return (
            <div key={objetivo.id} className={styles.objetivoContainer}>
                <div className={styles.objetivoItem}>
                    {hasChildren ? (
                        <button
                            className={styles.objetivoExpand}
                            onClick={() => toggleObjetivo(objetivo.id)}
                        >
                            <ChevronRight
                                size={16}
                                className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                            />
                        </button>
                    ) : (
                        <div className={styles.objetivoExpandPlaceholder} />
                    )}

                    <div
                        className={styles.objetivoMain}
                        onClick={handleObjetivoClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.objetivoTop}>
                            <span className={styles.objetivoCodigo}>{objetivo.codigo}</span>
                            <span className={styles.objetivoDescricao}>{objetivo.titulo || objetivo.descricao}</span>
                        </div>
                        <div className={styles.objetivoMeta}>
                            {objetivo.responsavel && (
                                <span className={styles.objetivoMetaItem}>
                                    <User size={12} /> {objetivo.responsavel}
                                </span>
                            )}
                            {objetivo.data_expectativa && (
                                <span className={styles.objetivoMetaItem}>
                                    <Calendar size={12} /> {formatDate(objetivo.data_expectativa)}
                                </span>
                            )}
                            {/* Task counts */}
                            {tarefas.length > 0 && (() => {
                                const completed = tarefas.filter(t => t.concluida).length;
                                const hasPending = completed < tarefas.length;
                                return (
                                    <span className={`${styles.taskCountBadge} ${hasPending ? styles.pending : ''}`}>
                                        <CheckSquare size={12} />
                                        {completed}/{tarefas.length}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    <div className={styles.objetivoActions}>
                        <button
                            className={styles.objetivoActionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('objetivo', { projeto_id: projetoId, parent_id: objetivo.id });
                            }}
                            title="Adicionar Sub-objetivo"
                        >
                            <Plus size={12} />
                            <span>Sub</span>
                        </button>
                        <button
                            className={styles.objetivoActionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('objetivo', { ...objetivo, projeto_id: projetoId });
                            }}
                            title="Editar"
                        >
                            <Pencil size={12} />
                            <span>Editar</span>
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <>
                        {/* Tarefas */}
                        {tarefas.length > 0 && (
                            <div className={styles.tarefasContainer}>
                                <div className={styles.tarefasHeader}>
                                    <span className={styles.tarefasTitle}>Tarefas</span>
                                </div>
                                {tarefas.map(tarefa => (
                                    <div key={tarefa.id} className={styles.tarefaItem}>
                                        <input
                                            type="checkbox"
                                            className={styles.tarefaCheckbox}
                                            checked={tarefa.concluida}
                                            onChange={() => toggleTarefa(tarefa, objetivo.id)}
                                        />
                                        <div className={styles.tarefaMain}>
                                            <div className={styles.tarefaTop}>
                                                <span className={styles.tarefaCodigo}>{tarefa.codigo}</span>
                                                <span className={`${styles.tarefaDescricao} ${tarefa.concluida ? styles.concluida : ''}`}>
                                                    {tarefa.titulo || tarefa.descricao}
                                                </span>
                                            </div>
                                            <div className={styles.tarefaMeta}>
                                                {tarefa.responsavel && `${tarefa.responsavel}`}
                                                {tarefa.responsavel && tarefa.data_expectativa && ' • '}
                                                {tarefa.data_expectativa && formatDate(tarefa.data_expectativa)}
                                            </div>
                                        </div>
                                        <div className={styles.tarefaActions}>
                                            <button
                                                className={`${styles.tinyBtn} ${styles.notes}`}
                                                onClick={() => openNotas(tarefa.id)}
                                                title="Notas"
                                            >
                                                <StickyNote size={14} />
                                            </button>
                                            <button
                                                className={styles.tinyBtn}
                                                onClick={() => openModal('tarefa', { ...tarefa, objetivo_id: objetivo.id })}
                                                title="Editar"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                className={`${styles.tinyBtn} ${styles.delete}`}
                                                onClick={() => {
                                                    if (confirm('Excluir esta tarefa?')) {
                                                        tarefasService.remove(tarefa.id).then(() => loadTarefas(objetivo.id));
                                                    }
                                                }}
                                                title="Excluir"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sub-objetivos */}
                        {hasChildren && (
                            <div className={styles.objetivoChildren}>
                                {objetivo.children.map(child => renderObjetivo(child, projetoId, level + 1))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container">
                <div className={styles.loading}>Carregando...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedFrente && (
                    <button
                        onClick={() => setSelectedFrente(null)}
                        title="Voltar"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="page-title" style={{ flex: 1 }}>
                    {selectedFrente ? `${selectedFrente.codigo} - ${selectedFrente.descricao}` : 'Frentes Estratégicas'}
                </h1>
                {selectedFrente && (
                    <button
                        className={styles.addProjectHeaderBtn}
                        onClick={() => openModal('projeto', { frente_id: selectedFrente.id })}
                    >
                        <Plus size={18} /> Novo Projeto
                    </button>
                )}
            </div>

            {frentes.length === 0 ? (
                <div className={styles.emptyState}>
                    <Target size={48} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Nenhuma frente estratégica</h2>
                    <p className={styles.emptyDescription}>
                        Acesse o menu Configurações para cadastrar suas frentes estratégicas.
                    </p>
                </div>
            ) : selectedFrente ? (
                // ========== VISUALIZAÇÃO INTERNA DA FRENTE ==========
                <div className={styles.treeContainer}>
                    {/* Search and Filters */}
                    <div className={styles.searchFilterRow}>
                        <div className={styles.searchBar}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Pesquisar por projeto ou objetivo..."
                                value={frenteSearchTerm}
                                onChange={(e) => setFrenteSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterControls}>
                            <button
                                className={`${styles.filterToggle} ${filterPendingOnly ? styles.active : ''}`}
                                onClick={() => setFilterPendingOnly(!filterPendingOnly)}
                                title="Mostrar apenas com tarefas pendentes"
                            >
                                <CheckSquare size={16} />
                                Pendentes
                            </button>
                            <input
                                type="date"
                                className={styles.filterDateInput}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                title="Filtrar por data de expectativa"
                            />
                        </div>
                    </div>

                    {(!selectedFrente.projetos || selectedFrente.projetos.length === 0) ? (
                        <div className={styles.emptyStateCentered}>
                            <FolderKanban size={48} className={styles.emptyIcon} />
                            <h2 className={styles.emptyTitle}>Nenhum projeto</h2>
                            <p className={styles.emptyDescription}>
                                Esta frente estratégica ainda não possui projetos.
                            </p>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => openModal('projeto', { frente_id: selectedFrente.id })}
                            >
                                <Plus size={16} /> Adicionar Projeto
                            </button>
                        </div>
                    ) : (
                        selectedFrente.projetos
                            .filter(projeto => {
                                // Search filter
                                if (frenteSearchTerm.trim()) {
                                    const term = frenteSearchTerm.toLowerCase();
                                    const matchesProject = projeto.codigo?.toLowerCase().includes(term) ||
                                        projeto.descricao?.toLowerCase().includes(term);
                                    const projetoObjetivos = objetivosTree[projeto.id] || [];
                                    const matchesObjective = projetoObjetivos.some(obj =>
                                        obj.titulo?.toLowerCase().includes(term) ||
                                        obj.descricao?.toLowerCase().includes(term) ||
                                        obj.codigo?.toLowerCase().includes(term)
                                    );
                                    if (!matchesProject && !matchesObjective) return false;
                                }

                                // Pending tasks filter
                                if (filterPendingOnly) {
                                    const projetoObjetivos = objetivosTree[projeto.id] || [];
                                    const hasPendingTasks = projetoObjetivos.some(obj => {
                                        const objTarefas = tarefasMap[obj.id] || [];
                                        return objTarefas.some(t => !t.concluida);
                                    });
                                    if (!hasPendingTasks) return false;
                                }

                                // Date filter
                                if (filterDate) {
                                    const projetoObjetivos = objetivosTree[projeto.id] || [];
                                    const matchesDate = projetoObjetivos.some(obj => {
                                        if (obj.data_expectativa === filterDate) return true;
                                        const objTarefas = tarefasMap[obj.id] || [];
                                        return objTarefas.some(t => t.data_expectativa === filterDate);
                                    });
                                    if (!matchesDate) return false;
                                }

                                return true;
                            })
                            .map(projeto => (
                                <div key={projeto.id} className={styles.projetoCard}>
                                    <div
                                        className={styles.projetoHeader}
                                        onClick={() => toggleProjeto(projeto.id)}
                                    >
                                        <div className={styles.projetoInfo}>
                                            <span className={styles.projetoCodigo}>{projeto.codigo}</span>
                                            <span className={styles.projetoDescricao}>{projeto.descricao}</span>
                                        </div>
                                        <div className={styles.projetoActions}>
                                            <button
                                                className={styles.projetoActionBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal('objetivo', { projeto_id: projeto.id });
                                                }}
                                                title="Adicionar Objetivo"
                                            >
                                                <Plus size={14} />
                                                <span>Objetivo</span>
                                            </button>
                                            <button
                                                className={styles.projetoActionBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal('projeto', { ...projeto, frente_id: selectedFrente.id });
                                                }}
                                                title="Editar Projeto"
                                            >
                                                <Pencil size={12} />
                                                <span>Editar</span>
                                            </button>
                                            <ChevronRight
                                                size={18}
                                                className={`${styles.expandIcon} ${styles.whiteIcon} ${expandedProjetos[projeto.id] ? styles.expanded : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {expandedProjetos[projeto.id] && (
                                        <div className={styles.projetoContent}>
                                            {objetivosTree[projeto.id]?.length > 0 ? (
                                                objetivosTree[projeto.id].map(objetivo => renderObjetivo(objetivo, projeto.id))
                                            ) : (
                                                <button
                                                    className={styles.addButton}
                                                    onClick={() => openModal('objetivo', { projeto_id: projeto.id })}
                                                >
                                                    <Flag size={16} />
                                                    Adicionar Objetivo
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            ) : (
                // ========== LISTA DE FRENTES ESTRATÉGICAS ==========
                <div className={styles.treeContainer}>
                    {frentes.map(frente => (
                        <div key={frente.id} className={styles.frenteCard}>
                            <div
                                className={styles.frenteHeader}
                                onClick={() => setSelectedFrente(frente)}
                            >
                                <div className={styles.frenteInfo}>
                                    <span className={styles.frenteCodigo}>{frente.codigo}</span>
                                    <span className={styles.frenteDescricao}>{frente.descricao}</span>
                                </div>
                                <div className={styles.frenteActions}>
                                    <ChevronRight
                                        size={20}
                                        className={styles.expandIcon}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {modalType === 'frente' && <Target size={22} style={{ marginRight: '10px' }} />}
                                {modalType === 'projeto' && <FolderKanban size={22} style={{ marginRight: '10px' }} />}
                                {modalType === 'objetivo' && <Flag size={22} style={{ marginRight: '10px' }} />}
                                {modalType === 'tarefa' && <CheckSquare size={22} style={{ marginRight: '10px' }} />}
                                {modalData.id ? 'Editar' : 'Novo'}{' '}
                                {modalType === 'frente' && 'Frente Estratégica'}
                                {modalType === 'projeto' && 'Projeto'}
                                {modalType === 'objetivo' && (modalData.parent_id ? 'Sub-objetivo' : 'Objetivo')}
                                {modalType === 'tarefa' && 'Tarefa'}
                            </h3>
                            <button className={styles.modalClose} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {/* ========== PROJETO FORM ========== */}
                                {modalType === 'projeto' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Nome do Projeto *</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={modalData.descricao || ''}
                                                onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                                                required
                                                autoFocus
                                                placeholder="Ex: Modernização de Sistemas"
                                                maxLength={500}
                                            />
                                        </div>
                                        {selectedFrente && (
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Frente Estratégica</label>
                                                <div className={styles.readOnlyField}>
                                                    <Target size={16} />
                                                    {selectedFrente.codigo} - {selectedFrente.descricao}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ========== FRENTE FORM ========== */}
                                {modalType === 'frente' && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Nome da Frente *</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={modalData.descricao || ''}
                                            onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                                            required
                                            autoFocus
                                            placeholder="Ex: Transformação Digital"
                                            maxLength={500}
                                        />
                                    </div>
                                )}

                                {/* ========== TAREFA FORM ========== */}
                                {modalType === 'tarefa' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Título *</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={modalData.titulo || ''}
                                                onChange={(e) => setModalData({ ...modalData, titulo: e.target.value })}
                                                required
                                                autoFocus
                                                placeholder="Ex: Configurar ambiente"
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Descrição</label>
                                            <textarea
                                                className={styles.formTextarea}
                                                value={modalData.descricao || ''}
                                                onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                                                placeholder="Detalhes adicionais da tarefa (opcional)"
                                                rows={3}
                                            />
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Responsável</label>
                                                <select
                                                    className={styles.formSelect}
                                                    value={modalData.responsavel || ''}
                                                    onChange={(e) => setModalData({ ...modalData, responsavel: e.target.value })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {responsaveis.map(resp => (
                                                        <option key={resp.id} value={resp.nome}>
                                                            {resp.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Data Expectativa</label>
                                                <input
                                                    type="date"
                                                    className={styles.formInput}
                                                    value={modalData.data_expectativa || ''}
                                                    onChange={(e) => setModalData({ ...modalData, data_expectativa: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ========== OBJETIVO FORM ========== */}
                                {modalType === 'objetivo' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Título *</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={modalData.titulo || ''}
                                                onChange={(e) => setModalData({ ...modalData, titulo: e.target.value })}
                                                required
                                                autoFocus
                                                placeholder="Ex: Implementar novo CRM"
                                                maxLength={200}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Descrição</label>
                                            <textarea
                                                className={styles.formTextarea}
                                                value={modalData.descricao || ''}
                                                onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                                                placeholder="Detalhes do objetivo (opcional)"
                                                rows={3}
                                            />
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Responsável</label>
                                                <select
                                                    className={styles.formSelect}
                                                    value={modalData.responsavel || ''}
                                                    onChange={(e) => setModalData({ ...modalData, responsavel: e.target.value })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {responsaveis.map(resp => (
                                                        <option key={resp.id} value={resp.nome}>
                                                            {resp.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Data Expectativa</label>
                                                <input
                                                    type="date"
                                                    className={styles.formInput}
                                                    value={modalData.data_expectativa || ''}
                                                    onChange={(e) => setModalData({ ...modalData, data_expectativa: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className={styles.modalFooter}>
                                {modalData.id && (
                                    <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
                                        <Trash2 size={16} />
                                        Excluir
                                    </button>
                                )}
                                <div className={styles.footerRight}>
                                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className={styles.submitBtn} disabled={saving}>
                                        {saving ? 'Salvando...' : (modalData.id ? 'Salvar' : 'Criar')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notas Modal */}
            {showNotasFor && (
                <div className={styles.modalOverlay} onClick={closeNotas}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <MessageSquare size={20} style={{ marginRight: '8px' }} />
                                Notas
                            </h3>
                            <button className={styles.modalClose} onClick={closeNotas}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.notasPanel}>
                            <div className={styles.notasList}>
                                {notas.length === 0 ? (
                                    <div className={styles.emptyState} style={{ padding: '24px' }}>
                                        Nenhuma nota registrada
                                    </div>
                                ) : (
                                    notas.map(nota => (
                                        <div key={nota.id} className={styles.notaItem}>
                                            <div className={styles.notaHeader}>
                                                <span className={styles.notaMeta}>
                                                    <strong>{nota.usuario}</strong> • {formatDateTime(nota.data_hora)}
                                                </span>
                                                <button
                                                    className={styles.tinyBtn}
                                                    onClick={() => {
                                                        if (confirm('Excluir esta nota?')) {
                                                            notasService.remove(nota.id).then(() => loadNotas(showNotasFor));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p className={styles.notaTexto}>{nota.texto}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className={styles.notaForm}>
                                <textarea
                                    className={styles.notaInput}
                                    value={newNota}
                                    onChange={(e) => setNewNota(e.target.value)}
                                    placeholder="Adicionar uma nota..."
                                    rows={2}
                                />
                                <button
                                    className={styles.submitBtn}
                                    onClick={addNota}
                                    disabled={!newNota.trim()}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Objetivo Detail Modal */}
            {selectedObjetivo && (
                <div className={styles.modalOverlay} onClick={() => { setSelectedObjetivo(null); setShowNewTarefaForm(false); }}>
                    <div className={`${styles.modal} ${styles.modalLarge}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <Flag size={20} style={{ marginRight: '8px' }} />
                                {editingObjetivo ? 'Editar Objetivo' : `${selectedObjetivo.codigo} - ${selectedObjetivo.descricao}`}
                            </h3>
                            <div className={styles.headerButtons}>
                                <button className={styles.modalClose} onClick={() => { setSelectedObjetivo(null); setShowNewTarefaForm(false); setEditingObjetivo(false); }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.modalBody}>
                            {showNewTarefaForm ? (
                                // ========== FORMULÁRIO NOVA TAREFA ==========
                                <div className={styles.editSection}>
                                    <h4 className={styles.tarefasSectionTitle} style={{ marginBottom: '16px' }}>
                                        <Plus size={18} /> Nova Tarefa
                                    </h4>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Título *</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={newTarefaData.titulo}
                                            onChange={(e) => setNewTarefaData({ ...newTarefaData, titulo: e.target.value })}
                                            placeholder="Ex: Configurar ambiente"
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Descrição</label>
                                        <textarea
                                            className={styles.formTextarea}
                                            value={newTarefaData.descricao}
                                            onChange={(e) => setNewTarefaData({ ...newTarefaData, descricao: e.target.value })}
                                            rows={3}
                                            placeholder="Detalhes adicionais (opcional)"
                                        />
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Responsável</label>
                                            <select
                                                className={styles.formSelect}
                                                value={newTarefaData.responsavel}
                                                onChange={(e) => setNewTarefaData({ ...newTarefaData, responsavel: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                {responsaveis.map(resp => (
                                                    <option key={resp.id} value={resp.nome}>
                                                        {resp.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Data Expectativa</label>
                                            <input
                                                type="date"
                                                className={styles.formInput}
                                                value={newTarefaData.data_expectativa}
                                                onChange={(e) => setNewTarefaData({ ...newTarefaData, data_expectativa: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // ========== LISTA DE TAREFAS DO OBJETIVO ==========
                                <>
                                    {editingObjetivo ? (
                                        // Formulário de edição inline de objetivo
                                        <div className={styles.editSection}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Descrição</label>
                                                <textarea
                                                    className={styles.formTextarea}
                                                    value={objetivoEditData.descricao}
                                                    onChange={(e) => setObjetivoEditData({ ...objetivoEditData, descricao: e.target.value })}
                                                    rows={3}
                                                />
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Responsável</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={objetivoEditData.responsavel}
                                                        onChange={(e) => setObjetivoEditData({ ...objetivoEditData, responsavel: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Data Expectativa</label>
                                                    <input
                                                        type="date"
                                                        className={styles.formInput}
                                                        value={objetivoEditData.data_expectativa}
                                                        onChange={(e) => setObjetivoEditData({ ...objetivoEditData, data_expectativa: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.editActions}>
                                                <button className={styles.cancelBtn} onClick={handleCancelEditObjetivo}>Cancelar</button>
                                                <button className={styles.submitBtn} onClick={handleSaveObjetivoEdit} disabled={savingObjetivo}>
                                                    <Save size={16} /> {savingObjetivo ? 'Salvando...' : 'Salvar'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Visualização do objetivo e lista de tarefas
                                        <>
                                            {/* Objetivo Info */}
                                            <div className={styles.objetivoDetailInfo}>
                                                {selectedObjetivo.responsavel && (
                                                    <span className={styles.objetivoMetaItem}>
                                                        <User size={14} /> <strong>Responsável:</strong> {selectedObjetivo.responsavel}
                                                    </span>
                                                )}
                                                {selectedObjetivo.data_expectativa && (
                                                    <span className={styles.objetivoMetaItem}>
                                                        <Calendar size={14} /> <strong>Expectativa:</strong> {formatDate(selectedObjetivo.data_expectativa)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Sub-objetivos Section (antes das tarefas) */}
                                            {selectedObjetivo.children && selectedObjetivo.children.length > 0 && (
                                                <div className={styles.subObjetivosSection}>
                                                    <h4 className={styles.tarefasSectionTitle}>
                                                        <Flag size={18} /> Sub-objetivos
                                                    </h4>
                                                    <div className={styles.subObjetivosList}>
                                                        {selectedObjetivo.children.map(child => (
                                                            <div
                                                                key={child.id}
                                                                className={styles.subObjetivoItem}
                                                                onClick={() => {
                                                                    setSelectedObjetivo(child);
                                                                    setShowNewTarefaForm(false);
                                                                    setEditingObjetivo(false);
                                                                }}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <span className={styles.subObjetivoCodigo}>{child.codigo}</span>
                                                                <span className={styles.subObjetivoDescricao}>
                                                                    {child.titulo || child.descricao}
                                                                </span>
                                                                <ChevronRight size={16} className={styles.tarefaChevron} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tarefas Section */}
                                            <div className={styles.tarefasSection}>
                                                <div className={styles.tarefasSectionHeader}>
                                                    <h4 className={styles.tarefasSectionTitle}>
                                                        <CheckSquare size={18} /> Tarefas
                                                    </h4>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={handleShowNewTarefaForm}
                                                    >
                                                        <Plus size={16} />
                                                        Nova Tarefa
                                                    </button>
                                                </div>

                                                {(!tarefasMap[selectedObjetivo.id] || tarefasMap[selectedObjetivo.id].length === 0) ? (
                                                    <div className={styles.emptyState} style={{ padding: '24px' }}>
                                                        Nenhuma tarefa cadastrada para este objetivo.
                                                    </div>
                                                ) : (
                                                    <div className={styles.tarefasListDetail}>
                                                        {tarefasMap[selectedObjetivo.id].map(tarefa => (
                                                            <div
                                                                key={tarefa.id}
                                                                className={styles.tarefaItemDetail}
                                                                onClick={() => handleSelectTarefa(tarefa)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <span className={`${styles.statusBadge} ${tarefa.concluida ? styles.concluida : styles.pendente}`}>
                                                                    {tarefa.concluida ? 'Concluída' : 'Pendente'}
                                                                </span>
                                                                <div className={styles.tarefaMain}>
                                                                    <div className={styles.tarefaTop}>
                                                                        <span className={styles.tarefaCodigo}>{tarefa.codigo}</span>
                                                                        <span className={`${styles.tarefaDescricao} ${tarefa.concluida ? styles.concluida : ''}`}>
                                                                            {tarefa.titulo || tarefa.descricao}
                                                                        </span>
                                                                    </div>
                                                                    <div className={styles.tarefaMeta}>
                                                                        {tarefa.responsavel && `${tarefa.responsavel}`}
                                                                        {tarefa.responsavel && tarefa.data_expectativa && ' • '}
                                                                        {tarefa.data_expectativa && formatDate(tarefa.data_expectativa)}
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={16} className={styles.tarefaChevron} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            <div className={styles.modalFooter}>
                                {showNewTarefaForm ? (
                                    // Botões para Nova Tarefa
                                    <>
                                        <button
                                            className={styles.footerCloseBtn}
                                            onClick={handleCancelNewTarefa}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className={styles.primaryBtn}
                                            onClick={handleCreateTarefaInline}
                                            disabled={!newTarefaData.titulo?.trim() || savingTarefa}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            <Save size={16} style={{ marginRight: '4px' }} />
                                            {savingTarefa ? 'Criando...' : 'Criar Tarefa'}
                                        </button>
                                    </>
                                ) : (
                                    // Botões padrão: Fechar e Editar
                                    <>
                                        <button
                                            className={styles.footerCloseBtn}
                                            onClick={() => { setSelectedObjetivo(null); setShowNewTarefaForm(false); }}
                                        >
                                            Fechar
                                        </button>
                                        {!editingObjetivo && (
                                            <button
                                                className={styles.primaryBtn}
                                                onClick={() => {
                                                    const objToEdit = { ...selectedObjetivo, projeto_id: selectedProjetoId };
                                                    setSelectedObjetivo(null);
                                                    setShowNewTarefaForm(false);
                                                    openModal('objetivo', objToEdit);
                                                }}
                                                style={{ marginLeft: '8px' }}
                                            >
                                                <Pencil size={16} style={{ marginRight: '4px' }} />
                                                Editar
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TarefaDetailModal - Modal padronizado para detalhes da tarefa */}
            {showTarefaModal && selectedTarefa && (
                <TarefaDetailModal
                    tarefa={selectedTarefa}
                    onClose={handleCloseTarefaModal}
                    onUpdate={handleTarefaUpdate}
                />
            )}
        </div >
    );
};

export default FrentesEstrategicas;
