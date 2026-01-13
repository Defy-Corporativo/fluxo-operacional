import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_notas';

/**
 * Busca todas as notas de uma tarefa
 */
export const getByTarefa = async (tarefaId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('tarefa_id', tarefaId)
        .order('data_hora', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Cria uma nova nota
 */
export const create = async ({ tarefa_id, texto, usuario }) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
            tarefa_id,
            texto,
            usuario,
            data_hora: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza uma nota
 */
export const update = async (id, texto) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ texto })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Exclui uma nota
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
    getByTarefa,
    create,
    update,
    remove
};
