import TarjetaProducto from "../componentes/tarjetaproducto";
import { createClient } from "../DataBase/supServer";

async function getProductos() {
    const supabase = await createClient()

    const { data: productos, error } = await supabase
    .from('productos')
    .select('id, Nombre, Descripcion, Precio, imagen');

    if (error) {
        console.error('Error al obtener productos:', error.message);
        return[];
    }

    return productos;
}

export default async function ProductosPage() {
    const productos = await getProductos();
    return (
        <section>
            {productos.map
                ((item) => (
                    <TarjetaProducto key={item.id+1}
                        productos={item} />
                ))}
        </section>
    )
}


