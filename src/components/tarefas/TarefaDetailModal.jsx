import React, { useState, useEffect } from 'react';
import {
    X, CheckSquare, Calendar, User, Pencil, Save,
    MessageSquare, Plus, Trash2, FolderKanban, Check, ChevronRight, Target, Flag
} from 'lucide-react';
import tarefasService from '../../services/tarefasService';
import notasService from '../../services/notasService';
import responsaveisService from '../../services/responsaveisService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TarefaDetailModal.module.css';

const TarefaDetailModal = ({ tarefa, onClose, onUpdate, frenteDescricao, projetoDescricao }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tarefaData, setTarefaData] = useState(null);
    const [notas, setNotas] = useState([]);
    const [newNota, setNewNota] = useState('');
    const [responsaveis, setResponsaveis] = useState([]);
    const [addingNota, setAddingNota] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingNotaId, setEditingNotaId] = useState(null);
    const [editingNotaTexto, setEditingNotaTexto] = useState('');
    const [notaSearchTerm, setNotaSearchTerm] = useState('');

    useEffect(() => {
        if (tarefa?.id) {
            loadTarefaDetails();
            loadResponsaveis();
        }
    }, [tarefa?.id]);

    const loadResponsaveis = async () => {
        try {
            const data = await responsaveisService.getAll();
            setResponsaveis(data || []);
        } catch (error) {
            console.error('Erro ao carregar responsáveis:', error);
        }
    };

    const loadTarefaDetails = async () => {
        try {
            setLoading(true);
            const data = await tarefasService.getById(tarefa.id);
            setTarefaData(data);
            setNotas(data.notas || []);
            setEditData({
                titulo: data.titulo || '',
                descricao: data.descricao || '',
                responsavel: data.responsavel || '',
                data_expectativa: data.data_expectativa || '',
                concluida: data.concluida || false
            });
        } catch (error) {
            console.error('Erro ao carregar tarefa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNota = async () => {
        if (!newNota.trim() || addingNota) return;
        try {
            setAddingNota(true);
            await notasService.create({
                tarefa_id: tarefa.id,
                texto: newNota.trim(),
                usuario: user?.email?.split('@')[0] || 'Usuário'
            });
            setNewNota('');
            loadTarefaDetails();
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
            alert('Erro ao adicionar nota');
        } finally {
            setAddingNota(false);
        }
    };

    const handleDeleteNota = async (notaId) => {
        if (!confirm('Excluir esta nota?')) return;
        try {
            await notasService.remove(notaId);
            setNotas(notas.filter(n => n.id !== notaId));
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
            alert('Erro ao excluir nota');
        }
    };

    const handleEditNota = (nota) => {
        setEditingNotaId(nota.id);
        setEditingNotaTexto(nota.texto);
    };

    const handleSaveNotaEdit = async () => {
        if (!editingNotaTexto.trim()) return;
        try {
            await notasService.update(editingNotaId, { texto: editingNotaTexto.trim() });
            setNotas(notas.map(n => n.id === editingNotaId ? { ...n, texto: editingNotaTexto.trim() } : n));
            setEditingNotaId(null);
            setEditingNotaTexto('');
        } catch (error) {
            console.error('Erro ao editar nota:', error);
            alert('Erro ao editar nota');
        }
    };

    const handleCancelNotaEdit = () => {
        setEditingNotaId(null);
        setEditingNotaTexto('');
    };

    const handleSaveEdit = async () => {
        if (!editData.titulo?.trim() || saving) return;
        try {
            setSaving(true);
            await tarefasService.update(tarefa.id, editData);
            setTarefaData({ ...tarefaData, ...editData });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            const errorMessage = error?.message || 'Erro desconhecido';
            alert(`Erro ao atualizar tarefa: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleConcluida = async () => {
        try {
            await tarefasService.toggleConcluida(tarefa.id);
            const newState = !tarefaData?.concluida;
            setEditData({ ...editData, concluida: newState });
            setTarefaData({ ...tarefaData, concluida: newState });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Excluir esta tarefa?')) return;
        try {
            await tarefasService.remove(tarefa.id);
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            alert('Erro ao excluir tarefa');
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

    if (!tarefa) return null;

    const isConcluida = tarefaData?.concluida || false;

    return (
        <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <CheckSquare size={20} className={styles.headerIcon} />
                        <div className={styles.headerText}>
                            <span className={styles.headerCodigo}>{tarefaData?.codigo || tarefa.codigo}</span>
                            <h2 className={styles.headerTitulo}>
                                {tarefaData?.titulo || tarefaData?.descricao || tarefa.titulo || tarefa.descricao}
                            </h2>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} title="Fechar">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Carregando...</div>
                    ) : (
                        <>
                            {/* Status e Conclusão */}
                            <div className={styles.statusRow}>
                                <div className={styles.statusCard}>
                                    <span className={styles.statusLabel}>Status</span>
                                    <span className={`${styles.statusBadge} ${isConcluida ? styles.concluida : styles.pendente}`}>
                                        {isConcluida ? 'Concluída' : 'Pendente'}
                                    </span>
                                </div>
                                {!isEditing && !loading && (
                                    <button
                                        className={`${styles.concluirBtn} ${isConcluida ? styles.reabrir : ''}`}
                                        onClick={handleToggleConcluida}
                                    >
                                        <Check size={18} />
                                        {isConcluida ? 'Reabrir' : 'Concluir'}
                                    </button>
                                )}
                            </div>

                            {/* Edit Mode */}
                            {isEditing ? (
                                <div className={styles.editSection}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Título *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={editData.titulo}
                                            onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                                            placeholder="Título da tarefa"
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Descrição</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={editData.descricao}
                                            onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                                            rows={3}
                                            placeholder="Detalhes adicionais (opcional)"
                                        />
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Responsável</label>
                                            <select
                                                className={styles.input}
                                                value={editData.responsavel || ''}
                                                onChange={(e) => setEditData({ ...editData, responsavel: e.target.value })}
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
                                            <label className={styles.label}>Data Expectativa</label>
                                            <input
                                                type="date"
                                                className={styles.input}
                                                value={editData.data_expectativa}
                                                onChange={(e) => setEditData({ ...editData, data_expectativa: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.editActions}>
                                        <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                                            Cancelar
                                        </button>
                                        <button
                                            className={styles.saveBtn}
                                            onClick={handleSaveEdit}
                                            disabled={saving}
                                        >
                                            <Save size={16} />
                                            {saving ? 'Salvando...' : 'Salvar'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode - Details Cards */
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailCard}>
                                        <User size={16} className={styles.detailIcon} />
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Responsável</span>
                                            <span className={styles.detailValue}>
                                                {tarefaData?.responsavel || 'Não definido'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.detailCard}>
                                        <Calendar size={16} className={styles.detailIcon} />
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Expectativa</span>
                                            <span className={styles.detailValue}>
                                                {tarefaData?.data_expectativa
                                                    ? formatDate(tarefaData.data_expectativa)
                                                    : 'Não definida'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Hierarchy: Frente > Projeto > Objetivo */}
                                    {(frenteDescricao || projetoDescricao || tarefaData?.objetivo) && (
                                        <div className={`${styles.detailCard} ${styles.fullWidth}`}>
                                            <FolderKanban size={16} className={styles.detailIcon} />
                                            <div className={styles.detailContent}>
                                                <span className={styles.detailLabel}>Localização</span>
                                                <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    {frenteDescricao && (
                                                        <>
                                                            <Target size={12} style={{ opacity: 0.6 }} />
                                                            <span>{frenteDescricao}</span>
                                                            <ChevronRight size={12} style={{ opacity: 0.4 }} />
                                                        </>
                                                    )}
                                                    {projetoDescricao && (
                                                        <>
                                                            <span>{projetoDescricao}</span>
                                                            <ChevronRight size={12} style={{ opacity: 0.4 }} />
                                                        </>
                                                    )}
                                                    {tarefaData?.objetivo && (
                                                        <>
                                                            <Flag size={12} style={{ opacity: 0.6 }} />
                                                            <span>{tarefaData.objetivo.descricao}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Descrição Section */}
                            {!isEditing && tarefaData?.descricao && (
                                <div className={styles.descricaoSection}>
                                    <h3 className={styles.descricaoTitle}>Descrição</h3>
                                    <p className={styles.descricaoTexto}>{tarefaData.descricao}</p>
                                </div>
                            )}

                            {/* Action Buttons Removed from here to moved to footer */
                                null
                            }

                            {/* Notas Section */}
                            <div className={styles.notasSection}>
                                <div className={styles.notasHeader}>
                                    <h3 className={styles.notasTitle}>
                                        <MessageSquare size={18} />
                                        Notas ({notas.length})
                                    </h3>
                                </div>

                                {/* Search Notas */}
                                <div className={styles.notaSearchBar}>
                                    <input
                                        type="text"
                                        className={styles.notaSearchInput}
                                        placeholder="Pesquisar notas..."
                                        value={notaSearchTerm}
                                        onChange={(e) => setNotaSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Add Nota Form */}
                                <div className={styles.notaForm}>
                                    <textarea
                                        className={styles.notaInput}
                                        placeholder="Escreva uma nota..."
                                        value={newNota}
                                        onChange={(e) => setNewNota(e.target.value)}
                                        rows={2}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                        <button
                                            className={styles.notaAddBtn}
                                            onClick={handleAddNota}
                                            disabled={!newNota.trim() || addingNota}
                                        >
                                            <Plus size={16} />
                                            {addingNota ? 'Adicionando...' : 'Adicionar Nota'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.notasList}>
                                {notas.length === 0 ? (
                                    <div className={styles.notasEmpty}>
                                        Nenhuma nota registrada
                                    </div>
                                ) : (
                                    notas
                                        .filter(nota => {
                                            if (!notaSearchTerm.trim()) return true;
                                            const term = notaSearchTerm.toLowerCase();
                                            const texto = (nota.texto || '').toLowerCase();
                                            const usuario = (nota.usuario || '').toLowerCase();
                                            return texto.includes(term) || usuario.includes(term);
                                        })
                                        .map(nota => (
                                            <div key={nota.id} className={styles.notaItem}>
                                                <div className={styles.notaIconArea}>
                                                    <MessageSquare size={16} className={styles.notaIcon} />
                                                    <span className={styles.notaIconLabel}>Nota</span>
                                                </div>
                                                <div className={styles.notaContent}>
                                                    <div className={styles.notaMeta}>
                                                        <span className={styles.notaAutor}>{nota.usuario}</span>
                                                        <span className={styles.notaData}>{formatDateTime(nota.data_hora)}</span>
                                                    </div>
                                                    {editingNotaId === nota.id ? (
                                                        <div className={styles.notaEditForm}>
                                                            <textarea
                                                                className={styles.notaEditInput}
                                                                value={editingNotaTexto}
                                                                onChange={(e) => setEditingNotaTexto(e.target.value)}
                                                                rows={2}
                                                            />
                                                            <div className={styles.notaEditActions}>
                                                                <button className={styles.notaCancelBtn} onClick={handleCancelNotaEdit}>
                                                                    Cancelar
                                                                </button>
                                                                <button className={styles.notaSaveBtn} onClick={handleSaveNotaEdit}>
                                                                    <Save size={14} /> Salvar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className={styles.notaTexto}>{nota.texto}</p>
                                                    )}
                                                    {editingNotaId !== nota.id && (
                                                        <div className={styles.notaActions}>
                                                            <button
                                                                className={styles.notaEditBtn}
                                                                onClick={() => handleEditNota(nota)}
                                                                title="Editar nota"
                                                            >
                                                                <Pencil size={12} /> Editar
                                                            </button>
                                                            <button
                                                                className={styles.notaDeleteBtn}
                                                                onClick={() => handleDeleteNota(nota.id)}
                                                                title="Excluir nota"
                                                            >
                                                                <Trash2 size={12} /> Excluir
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer com botões */}
                <div className={styles.footer}>
                    {!isEditing ? (
                        <div className={styles.footerActions}>
                            <div className={styles.footerLeft}>
                                <button className={styles.editBtnSimple} onClick={() => setIsEditing(true)}>
                                    <Pencil size={16} />
                                    Editar
                                </button>
                                <button className={styles.deleteBtnSimple} onClick={handleDelete}>
                                    <Trash2 size={16} />
                                    Excluir
                                </button>
                            </div>
                            <button className={styles.footerCloseBtn} onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    ) : (
                        <div className={styles.footerActions}>
                            <button className={styles.footerCloseBtn} onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default TarefaDetailModal;
