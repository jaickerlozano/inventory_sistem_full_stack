import React from "react";
import ReactDOM from "react-dom";

export function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
    if (!isOpen) return null;

return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded" onClick={(e) => e.stopPropagation()}>
            {children}
            <form action="">
                <input type="text" placeholder="Nombre del producto..."/>
                <input type="text" placeholder="Stock actual..."/>
                <input type="text" placeholder="Stock mínimo..."/>
                <input type="text" placeholder="Stock máximo..."/>
                <input type="text" placeholder="Categoría..."/>
                <input type="text" placeholder="Proveedor..."/>
                <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Guardar
                </button>
            </form>
        </div>
    </div>,
    document.getElementById("modal-root")!
)
}