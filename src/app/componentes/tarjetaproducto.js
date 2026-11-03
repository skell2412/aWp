'use client'

import { useState } from 'react';
import Image from 'next/image';
import { Eliminarproductos } from '../actions/productosActions';

export default function TarjetaProducto({ productos }) {
  const [nombre, setNombre] = useState(productos?.Nombre || '');
  const [precio, setPrecio] = useState(productos?.Precio || '');
  const [agregado, setAgregado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 2000);
  };

  const handleEliminar = async () => {
    const confirmacion = window.confirm(`¿Estás seguro de eliminar "${productos?.Nombre || nombre}"?`);

    if (confirmacion) {
      setCargando(true);
      try {
        await Eliminarproductos(productos.id);
      } catch (error) {
        alert('Ocurrió un error al eliminar el producto');
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <article className="max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-700">
      
      <div className="relative">
        <Image
          className="w-full object-cover h-64"
          src={productos?.imagen || '/imagenes/mouse.webp'}
          width={400}
          height={300}
          alt={nombre || "Imagen del producto"}
        />
        <div className="absolute top-0"></div>
      </div>

      <div className="flex flex-col gap-1 mt-4 px-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
          {nombre || 'Nombre del producto'}
        </h2>
        <span className="font-semibold text-gray-800 dark:text-gray-50">
          ${precio || '0'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <button
          type="submit"
          className={`w-full text-white font-bold py-2 px-4 rounded transition ${
            agregado ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {agregado ? '¡Agregado!' : 'Agregar'}
        </button>

       
        <button
          type="button" 
          onClick={handleEliminar}
          disabled={cargando}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {cargando ? 'Eliminando...' : 'Eliminar producto'}
        </button>
      </form>
    </article>
  );
}