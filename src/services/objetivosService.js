import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_objetivos';

/**
 * Busca todos os objetivos
 */
export const getAll = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('codigo', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca objetivos por projeto (apenas nível 1 - raiz)
 */
export const getByProjeto = async (projetoId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('projeto_id', projetoId)
        .is('parent_id', null)
        .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca objetivos filhos de um objetivo pai
 */
export const getByParent = async (parentId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('parent_id', parentId)
        .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca a árvore completa de objetivos de um projeto
 */
export const getTree = async (projetoId) => {
    // Busca todos os objetivos do projeto
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('projeto_id', projetoId)
        .order('nivel', { ascending: true })
        .order('ordem', { ascending: true });

    if (error) throw error;

    // Monta a árvore hierárquica
    const buildTree = (items, parentId = null) => {
        return items
            .filter(item => item.parent_id === parentId)
            .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
    };

    return buildTree(data);
};

/**
 * Busca um objetivo por ID
 */
export const getById = async (id) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            projeto:flop_projetos(id, codigo, descricao)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cria um novo objetivo (código gerado automaticamente pelo trigger)
 */
/**
 * Cria um novo objetivo (código gerado automaticamente pelo trigger)
 */
export const create = async ({ titulo, descricao, responsavel, data_expectativa, projeto_id, parent_id = null }) => {
    // Calcula o nível baseado no pai
    let nivel = 1;
    if (parent_id) {
        const { data: parentData } = await supabase
            .from(TABLE_NAME)
            .select('nivel')
            .eq('id', parent_id)
            .single();

        if (parentData) {
            nivel = parentData.nivel + 1;
        }
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
            titulo,
            descricao,
            responsavel,
            data_expectativa,
            projeto_id,
            parent_id,
            nivel
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza um objetivo
 */
export const update = async (id, { titulo, descricao, responsavel, data_expectativa, ordem }) => {
    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (responsavel !== undefined) updateData.responsavel = responsavel;
    if (data_expectativa !== undefined) updateData.data_expectativa = data_expectativa;
    if (ordem !== undefined) updateData.ordem = ordem;

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Exclui um objetivo (cascata exclui sub-objetivos e tarefas)
 */
export const remove = async (id) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export default {
    getAll,
    getByProjeto,
    getByParent,
    getTree,
    getById,
    create,
    update,
    remove
};
