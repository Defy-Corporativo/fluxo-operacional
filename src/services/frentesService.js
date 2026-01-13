import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_frentes_estrategicas';

/**
 * Busca todas as frentes estratégicas com projetos
 */
export const getAll = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            projetos:flop_projetos(*)
        `)
        .order('codigo', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca uma frente por ID com projetos
 */
export const getById = async (id) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            projetos:flop_projetos(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cria uma nova frente (código gerado automaticamente pelo trigger)
 */
export const create = async (descricao) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({ descricao })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza uma frente
 */
export const update = async (id, descricao) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ descricao })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Exclui uma frente (cascata exclui projetos, objetivos e tarefas)
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
    getById,
    create,
    update,
    remove
};
