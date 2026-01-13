import React, { useState, useEffect } from 'react';
import {
    Plus, ChevronRight, ChevronLeft, Pencil, Trash2, X, Save,
    Target, FolderKanban, Flag, CheckSquare,
    Calendar, User, MessageSquare, StickyNote
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import frentesService from '../../services/frentesService';
import projetosService from '../../services/projetosService';
import objetivosService from '../../services/objetivosService';
import tarefasService from '../../services/tarefasService';
import notasService from '../../services/notasService';
import TarefaDetailModal from '../tarefas/TarefaDetailModal';
import styles from './FrentesEstrategicas.module.css';

const FrentesEstrategicas = () => {
    const { user } = useAuth();
    const [frentes, setFrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFrentes, setExpandedFrentes] = useState({});
    const [expandedProjetos, setExpandedProjetos] = useState({});
    const [expandedObjetivos, setExpandedObjetivos] = useState({});
    const [objetivosTree, setObjetivosTree] = useState({});
    const [tarefasMap, setTarefasMap] = useState({});

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
    }, []);

    const loadFrentes = async () => {
        try {
            setLoading(true);
            const data = await frentesService.getAll();
            setFrentes(data || []);
        } catch (error) {
            console.error('Erro ao carregar frentes:', error);
        } finally {
            setLoading(false);
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
                            descricao: modalData.descricao,
                            responsavel: modalData.responsavel,
                            data_expectativa: modalData.data_expectativa || null
                        });
                    } else {
                        await objetivosService.create({
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
        if (!objetivoEditData.descricao?.trim() || savingObjetivo) return;
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
                            <span className={styles.objetivoDescricao}>{objetivo.descricao}</span>
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
                        </div>
                    </div>

                    <div className={styles.objetivoActions}>
                        <button
                            className={`${styles.actionBtnLabeled} ${styles.add}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('objetivo', { projeto_id: projetoId, parent_id: objetivo.id });
                            }}
                            title="Adicionar Sub-objetivo"
                        >
                            <Plus size={14} />
                            <span className={styles.btnLabel}>Sub</span>
                        </button>
                        <button
                            className={styles.actionBtnLabeled}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('objetivo', { ...objetivo, projeto_id: projetoId });
                            }}
                            title="Editar"
                        >
                            <Pencil size={14} />
                            <span className={styles.btnLabel}>Editar</span>
                        </button>
                        <button
                            className={`${styles.actionBtnLabeled} ${styles.delete}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('objetivo', { ...objetivo, projeto_id: projetoId });
                            }}
                            title="Excluir"
                        >
                            <Trash2 size={14} />
                            <span className={styles.btnLabel}>Excluir</span>
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
            <div className="page-header">
                <h1 className="page-title">Fluxo Operacional</h1>
            </div>

            {frentes.length === 0 ? (
                <div className={styles.emptyState}>
                    <Target size={48} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Nenhuma frente estratégica</h2>
                    <p className={styles.emptyDescription}>
                        Acesse o menu Configurações para cadastrar suas frentes estratégicas.
                    </p>
                </div>
            ) : (
                <div className={styles.treeContainer}>
                    {frentes.map(frente => (
                        <div key={frente.id} className={styles.frenteCard}>
                            <div
                                className={styles.frenteHeader}
                                onClick={() => toggleFrente(frente.id)}
                            >
                                <div className={styles.frenteInfo}>
                                    <span className={styles.frenteCodigo}>{frente.codigo}</span>
                                    <span className={styles.frenteDescricao}>{frente.descricao}</span>
                                </div>
                                <div className={styles.frenteActions}>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal('projeto', { frente_id: frente.id });
                                        }}
                                        title="Adicionar Projeto"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal('frente', frente);
                                        }}
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <ChevronRight
                                        size={20}
                                        className={`${styles.expandIcon} ${expandedFrentes[frente.id] ? styles.expanded : ''}`}
                                    />
                                </div>
                            </div>

                            {expandedFrentes[frente.id] && (
                                <div className={styles.frenteContent}>
                                    {(!frente.projetos || frente.projetos.length === 0) ? (
                                        <button
                                            className={styles.addButton}
                                            onClick={() => openModal('projeto', { frente_id: frente.id })}
                                        >
                                            <FolderKanban size={16} />
                                            Adicionar Projeto
                                        </button>
                                    ) : (
                                        frente.projetos.map(projeto => (
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
                                                            className={styles.iconBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openModal('objetivo', { projeto_id: projeto.id });
                                                            }}
                                                            title="Adicionar Objetivo"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.iconBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openModal('projeto', { ...projeto, frente_id: frente.id });
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <ChevronRight
                                                            size={18}
                                                            className={`${styles.expandIcon} ${expandedProjetos[projeto.id] ? styles.expanded : ''}`}
                                                        />
                                                    </div>
                                                </div>

                                                {expandedProjetos[projeto.id] && (
                                                    <div className={styles.projetoContent}>
                                                        {(!objetivosTree[projeto.id] || objetivosTree[projeto.id].length === 0) ? (
                                                            <button
                                                                className={styles.addButton}
                                                                onClick={() => openModal('objetivo', { projeto_id: projeto.id })}
                                                            >
                                                                <Flag size={16} />
                                                                Adicionar Objetivo
                                                            </button>
                                                        ) : (
                                                            objetivosTree[projeto.id].map(objetivo =>
                                                                renderObjetivo(objetivo, projeto.id)
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {modalData.id ? 'Editar' : 'Nova'}{' '}
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
                                {modalType === 'tarefa' && (
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
                                )}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        {modalType === 'tarefa' ? 'Descrição' : 'Descrição *'}
                                    </label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={modalData.descricao || ''}
                                        onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                                        required={modalType !== 'tarefa'}
                                        autoFocus={modalType !== 'tarefa'}
                                        placeholder={
                                            modalType === 'frente' ? 'Ex: Transformação Digital' :
                                                modalType === 'projeto' ? 'Ex: Modernização de Sistemas' :
                                                    modalType === 'objetivo' ? 'Ex: Implementar novo CRM' :
                                                        'Detalhes adicionais da tarefa (opcional)'
                                        }
                                    />
                                </div>

                                {(modalType === 'objetivo' || modalType === 'tarefa') && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Responsável</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={modalData.responsavel || ''}
                                                onChange={(e) => setModalData({ ...modalData, responsavel: e.target.value })}
                                                placeholder="Nome do responsável"
                                            />
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
                                    </>
                                )}
                            </div>
                            <div className={styles.modalFooter}>
                                {modalData.id && (
                                    <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
                                        Excluir
                                    </button>
                                )}
                                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
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
                                {!editingObjetivo && (
                                    <button
                                        className={styles.headerBtn}
                                        onClick={handleEditObjetivo}
                                        title="Editar Objetivo"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                )}
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
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={newTarefaData.responsavel}
                                                onChange={(e) => setNewTarefaData({ ...newTarefaData, responsavel: e.target.value })}
                                            />
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
                                    <div className={styles.editActions}>
                                        <button className={styles.cancelBtn} onClick={handleCancelNewTarefa}>Cancelar</button>
                                        <button
                                            className={styles.submitBtn}
                                            onClick={handleCreateTarefaInline}
                                            disabled={!newTarefaData.titulo?.trim() || savingTarefa}
                                        >
                                            <Save size={16} /> {savingTarefa ? 'Criando...' : 'Criar Tarefa'}
                                        </button>
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
                                <button
                                    className={styles.footerCloseBtn}
                                    onClick={() => { setSelectedObjetivo(null); setShowNewTarefaForm(false); }}
                                >
                                    Fechar
                                </button>
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
        </div>
    );
};

export default FrentesEstrategicas;
