'use client'

import { useEffect, useState } from 'react';

export default function ContactosPage() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  
 useEffect(() => {
  const items = JSON.parse(localStorage.getItem('mensaje'));
  if(items){
    setMensaje(items);
    console.log('Datos Recuperados', mensaje) }
     },[]);


  

 useEffect(() => {
  localStorage.setItem('mensaje',JSON.stringify(mensaje));

}, [mensaje]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('STATE ACTUALIZADO');

  };

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="text-white relative px-4 py-10 bg-indigo-400 shadow-lg sm:rounded-3xl sm:p-20">

          <div className="text-center pb-6">
            <h1 className="text-3xl font-bold">Contact Us!</h1>
            <p className="text-gray-200 mt-1">
              Fill up the form below to send us a message.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              className="shadow mb-4 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              className="shadow mb-4 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />

            <input
              className="shadow mb-4 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Subject / Motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            <textarea
              className="shadow mb-4 min-h-0 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-28"
              placeholder="Type your message here..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            ></textarea>

            <div className="flex justify-between">
              <input
                className="shadow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
                type="submit"
                value="Send ➤"
              />
              <input
                className="shadow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
                type="reset"
                onClick={() => {
                  setNombre('');
                  setCorreo('');
                  setMotivo('');
                  setMensaje('');
                }}
              />
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

