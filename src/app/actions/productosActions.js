'use server'

import { createClient } from "../DataBase/supServer"
import { revalidatePath } from "next/cache"

export async function Eliminarproductos(id) {
    const supabase = await createClient()

    const {error } = await supabase
    .from ('productos')
    .delete()
    .eq('id', id)

    if (error) {

        console.error('Error al eliminar productos:',error.message)
        throw new Error('No se pudo eliminar el producto')
    }
    
}